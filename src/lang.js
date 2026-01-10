define(function(require, exports, module) {
    var langList = {
        'en': require('../l10n/en'),
        'de': require('../l10n/de'),
        'es': require('../l10n/es'),
        'fr': require('../l10n/fr'),
        'it': require('../l10n/it'),
        'zh_CN': require('../l10n/zh_CN'),
        'zh_TW': require('../l10n/zh_TW')
    };
    var defaultLang = 'en';
    function lang(text, block, lang) {
        if (lang === undefined) {
            lang = defaultLang;
        }
        
        var dict = langList[lang];
        if (dict === undefined) {
            dict = langList['en'];
        }
        block.split('/').forEach(function(ele, idx) {
            dict = dict[ele];
        });

        if (dict === undefined || dict === null) {
            return text;
        }

        return dict[text] || text;

    }
    function setDefaultLang(lang) {
        var native = require('./native');

        if (lang === undefined || lang === null || lang === 'system') {
            lang = native.app.getSystemLocaleSync();
            // For all languages except Chinese, use the first two characters
            if (lang.startsWith('zh')) {
                // Handle zh-Hans (Simplified) and zh-Hant (Traditional)
                if (lang.indexOf('Hans') !== -1 || lang.indexOf('CN') !== -1) {
                    lang = 'zh_CN';
                } else if (lang.indexOf('Hant') !== -1 || lang.indexOf('TW') !== -1 || lang.indexOf('HK') !== -1) {
                    lang = 'zh_TW';
                } else {
                    // Default to zh_CN for other zh variants
                    lang = 'zh_CN';
                }
            } else {
                lang = lang.substring(0, 2);
            }
        }
        
        if (langList[lang] !== undefined) {
            defaultLang = lang;
            return true;
        }
        return false;
    }

    return module.exports = {
        setDefaultLang : setDefaultLang,
        getDefaultLang: function() {
            return defaultLang;
        },
        t: lang,
        langList: langList
    };
});
