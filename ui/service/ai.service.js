/**
 * AI 服务 - 封装与 Rust 后端的 AI 功能交互
 */
angular.module('kityminderEditor')
    .service('aiService', ['$q', function($q) {
        var self = this;
        
        /**
         * 获取 Tauri core
         */
        function getTauriCore() {
            var tauri = window.__TAURI__ || {};
            return tauri.core || tauri.tauri;
        }
        
        /**
         * 检查 AI 是否已配置（必须测试通过）
         * @returns {Promise<boolean>}
         */
        self.isConfigured = function() {
            var deferred = $q.defer();
            var core = getTauriCore();
            
            if (!core) {
                deferred.resolve(false);
                return deferred.promise;
            }
            
            core.invoke('get_ai_config', {}).then(function(config) {
                // 必须有 API Key 且测试通过
                deferred.resolve(config && config.hasApiKey && config.testPassed);
            }).catch(function() {
                deferred.resolve(false);
            });
            
            return deferred.promise;
        };
        
        /**
         * 获取 AI 配置
         * @returns {Promise<Object>}
         */
        self.getConfig = function() {
            var deferred = $q.defer();
            var core = getTauriCore();
            
            if (!core) {
                deferred.reject('Tauri not available');
                return deferred.promise;
            }
            
            core.invoke('get_ai_config', {}).then(function(config) {
                deferred.resolve(config);
            }).catch(function(err) {
                deferred.reject(err);
            });
            
            return deferred.promise;
        };
        
        /**
         * 调用 AI 聊天接口
         * @param {Array} messages - 消息数组 [{role: 'user', content: '...'}]
         * @param {string} systemPrompt - 系统提示词
         * @returns {Promise<string>}
         */
        self.chat = function(messages, systemPrompt) {
            var deferred = $q.defer();
            var core = getTauriCore();
            
            if (!core) {
                deferred.reject('Tauri not available');
                return deferred.promise;
            }
            
            core.invoke('ai_chat', {
                messages: messages,
                systemPrompt: systemPrompt || null
            }).then(function(result) {
                deferred.resolve(result);
            }).catch(function(err) {
                deferred.reject(err);
            });
            
            return deferred.promise;
        };
        
        /**
         * AI 扩展节点 - 根据当前节点内容生成子节点
         * @param {string} nodeText - 节点文本
         * @param {number} levels - 扩展层级数
         * @param {string} richness - 内容丰富度: concise(精简), normal(正常), detailed(详细)
         * @param {string} mapContext - 可选，思维导图上下文
         * @param {string} nodePath - 可选，当前节点的路径
         * @returns {Promise<Object>} - 返回子节点树结构
         */
        self.expandNode = function(nodeText, levels, richness, mapContext, nodePath) {
            richness = richness || 'normal';
            
            var richnessDesc = {
                'concise': '每个节点的文本要精简（不超过 20 个字），子节点数量根据内容自动调整',
                'normal': '每个节点的文本要简洁（不超过 40 个字），子节点数量根据内容自动调整',
                'detailed': '每个节点的文本要详细一些（不超过 80 个字），子节点数量根据内容自动调整，内容要充实具体'
            };
            
            var systemPrompt = '你是一个思维导图助手。用户会给你一个主题，请帮助用户扩展这个主题，生成子节点。\n' +
                '要求：\n' +
                '1. 生成的内容要与主题相关且有意义\n' +
                '2. ' + richnessDesc[richness] + '\n' +
                '3. 返回 JSON 格式，结构为：{"children": [{"text": "子节点1", "children": [...]}, ...]}\n' +
                '4. 只返回 JSON，不要有其他内容';
            
            var userMessage = '';
            
            // 如果提供了思维导图上下文
            if (mapContext) {
                userMessage += '当前思维导图的完整内容：\n' + mapContext + '\n\n';
                if (nodePath) {
                    userMessage += '当前要扩展的节点位置：' + nodePath + '\n\n';
                }
                userMessage += '请为以下节点扩展 ' + levels + ' 层子节点（请结合上面的思维导图内容，避免生成重复或无关的内容）：\n' + nodeText;
            } else {
                userMessage = '请为以下主题扩展 ' + levels + ' 层子节点：\n' + nodeText;
            }
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt).then(function(result) {
                // 解析 JSON 响应
                try {
                    // 尝试提取 JSON 部分
                    var jsonMatch = result.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                    return JSON.parse(result);
                } catch (e) {
                    throw new Error('AI 返回格式错误: ' + e.message);
                }
            });
        };
        
        /**
         * AI 改写节点
         * @param {string} nodeText - 节点文本
         * @param {string} mode - 改写模式: expand(扩展), simplify(精简), polish(润色)
         * @returns {Promise<string>} - 返回改写后的文本
         */
        self.rewriteNode = function(nodeText, mode) {
            var modePrompts = {
                'expand': '请扩展以下内容，使其更详细（适合思维导图节点，不超过80个字）：',
                'simplify': '请精简以下内容，保留核心意思（不超过20个字）：',
                'polish': '请润色以下内容，使其表达更优雅专业（不超过80个字）：'
            };
            
            var systemPrompt = '你是一个文字优化助手。请直接返回优化后的文本，不要有任何解释或前缀。';
            var userMessage = modePrompts[mode] + '\n' + nodeText;
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt);
        };
        
        /**
         * AI 总结节点
         * @param {Array<string>} childTexts - 所有子节点的文本数组
         * @returns {Promise<string>} - 返回总结文本
         */
        self.summarizeNodes = function(childTexts) {
            var systemPrompt = '你是一个总结助手。请将用户提供的多个要点总结为一句话（不超过80个字）。直接返回总结内容，不要有任何解释或前缀。';
            var userMessage = '请总结以下要点：\n' + childTexts.map(function(t, i) { return (i + 1) + '. ' + t; }).join('\n');
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt);
        };
        
        /**
         * AI 生成思维导图
         * @param {string} topic - 主题或大纲
         * @returns {Promise<Object>} - 返回完整的思维导图 JSON 结构
         */
        self.generateMindMap = function(topic) {
            var systemPrompt = '你是一个思维导图生成助手。用户会给你一个主题或大纲，请生成一个完整的思维导图结构。\n' +
                '要求：\n' +
                '1. 生成2-4级分支，每级分支的子节点数根据内容自动调整\n' +
                '2. 每个节点的文本要简洁（不超过80个字）\n' +
                '3. 返回 JSON 格式，结构为：{"root": {"data": {"text": "中心主题"}, "children": [{"data": {"text": "分支1"}, "children": [...]}]}}\n' +
                '4. 只返回 JSON，不要有其他内容';
            
            var userMessage = '请为以下主题生成思维导图：\n' + topic;
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt).then(function(result) {
                try {
                    var jsonMatch = result.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                    return JSON.parse(result);
                } catch (e) {
                    throw new Error('AI 返回格式错误: ' + e.message);
                }
            });
        };
        
        /**
         * AI 问答 - 基于思维导图内容回答问题
         * @param {string} question - 用户问题
         * @param {string} mapContent - 思维导图内容（文本格式）
         * @returns {Promise<string>} - 返回回答
         */
        self.askQuestion = function(question, mapContent) {
            var systemPrompt = '你是一个思维导图助手。用户会提供一个思维导图的内容，并提出问题。请基于思维导图的内容回答问题。\n' +
                '如果问题与思维导图内容无关，请礼貌地说明并尝试给出有帮助的回答。';
            
            var userMessage = '思维导图内容：\n' + mapContent + '\n\n问题：' + question;
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt);
        };
        
        /**
         * AI 导出为文章
         * @param {string} mapContent - 思维导图内容
         * @param {string} format - 格式: article(文章), report(报告), outline(大纲)
         * @returns {Promise<string>} - 返回转换后的文本
         */
        self.exportAs = function(mapContent, format) {
            var formatPrompts = {
                'article': '请将以下思维导图内容转换为一篇流畅的文章：',
                'report': '请将以下思维导图内容转换为一份正式的报告（包含标题、摘要、各章节）：',
                'outline': '请将以下思维导图内容整理为详细的PPT大纲格式（每页幻灯片用【幻灯片N】标记），内容应该详细且完整：'
            };
            
            var systemPrompt = '你是一个文档转换助手。请将思维导图内容转换为用户要求的格式。';
            var userMessage = formatPrompts[format] + '\n\n' + mapContent;
            
            return self.chat([{role: 'user', content: userMessage}], systemPrompt);
        };
        
        return self;
    }]);
