angular.module('kityminderEditor')
    .filter('lang', ['config', function(config) {
        return function(text, block) {
            //var lang = config.get('lang');
            return window.editor.lang.t(text, block);
        };
    }])
    .filter('nl2br', ['$sce', function($sce) {
        return function(text) {
            if (!text) return '';
            // 转义 HTML 特殊字符
            var escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            // 将换行符转换为 <br>
            var html = escaped.replace(/\n/g, '<br>');
            return $sce.trustAsHtml(html);
        };
    }])
    .filter('markdown', ['$sce', function($sce) {
        // 配置 marked
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,       // 支持 GFM 换行
                gfm: true,          // 启用 GitHub 风格 Markdown
                sanitize: false,    // 不过滤 HTML（已弃用，使用 DOMPurify）
                smartLists: true,   // 更智能的列表处理
                smartypants: false  // 不转换引号等
            });
        }
        
        return function(text) {
            if (!text) return '';
            
            // 如果 marked 可用，使用它渲染 markdown
            if (typeof marked !== 'undefined') {
                try {
                    var html = marked.parse(text);
                    return $sce.trustAsHtml(html);
                } catch (e) {
                    console.error('Markdown parse error:', e);
                }
            }
            
            // 降级处理：转义 HTML 并转换换行符
            var escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            var html = escaped.replace(/\n/g, '<br>');
            return $sce.trustAsHtml(html);
        };
    }]);