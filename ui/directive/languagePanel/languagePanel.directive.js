angular.module('kityminderEditor')
    .directive('languagePanel', ['config', function(config) {
        return {
            restrict: 'E',
            templateUrl: 'ui/directive/languagePanel/languagePanel.html',
            scope: {
                minder: '=',
                editor: '='
            },
            replace: true,
            link: function(scope) {
                // Language settings
                scope.config = { lang: config.get('lang') || 'system' };
                scope.supportedLangs = [];
                
                var langLabels = {};

                scope.getLangLabel = function(key) {
                    return langLabels[key] || key;
                };

                // Watch for editor availability to populate language list
                scope.$watch('editor', function(editor) {
                    if (editor && editor.lang && editor.lang.langList) {
                        var list = [];
                        angular.forEach(editor.lang.langList, function(data, key) {
                            list.push({
                                key: key,
                                label: data.lang || key
                            });
                        });
                        scope.supportedLangs = list;
                        
                        
                        langLabels['system'] = editor.lang.t('systemlanguage', 'ui');
                        // Update labels map
                        angular.forEach(list, function(item) {
                            langLabels[item.key] = item.label;
                        });
                    }
                });

                scope.changeLang = function(lang) {
                    scope.config.lang = lang;
                    config.set('lang', lang);
                    config.save();
                    
                    alert(scope.editor.lang.t('langsavesuccess', 'ui'));
                };
            }
        };
    }]);
