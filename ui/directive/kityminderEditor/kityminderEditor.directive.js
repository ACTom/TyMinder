angular.module('kityminderEditor')
	.directive('kityminderEditor', ['config', 'minder.service', 'revokeDialog', 'native', 'document', '$timeout', function(config, minderService, revokeDialog, native, documentService, $timeout) {
		return {
			restrict: 'EA',
			templateUrl: 'ui/directive/kityminderEditor/kityminderEditor.html',
			replace: true,
			scope: {
				onInit: '&'
			},
			link: function(scope, element, attributes) {

				var $minderEditor = element.children('.minder-editor')[0];

				/**
				 * 根据文件路径打开文件（支持多种格式）
				 * @param {object} editor - editor 实例
				 * @param {string} filePath - 文件路径
				 * @param {boolean} setPath - 是否设置为当前文档路径（仅 .km 格式）
				 */
				function openFile(editor, filePath, setPath) {
					var minder = editor.minder;
					var ProtocolManager = editor.ProtocolManager;
					
					if (!ProtocolManager) {
						var errMsg = editor.lang.t('protocolnotavailable', 'ui/error');
						console.error('[TyMinder]', errMsg);
						return Promise.reject(new Error(errMsg));
					}

					// 根据扩展名查找协议
					var found = ProtocolManager.findByExtension(filePath);
					if (!found) {
						var ext = filePath.split('.').pop();
						var errMsg = editor.lang.t('unsupportedformat', 'ui/error') + ': .' + ext;
						console.error('[TyMinder]', errMsg);
						return Promise.reject(new Error(errMsg));
					}

					var protocolName = found.name;
					var protocol = found.protocol;
					
					console.log('[TyMinder] Opening file:', filePath, 'with protocol:', protocolName);

					// 根据数据类型选择读取方式
					var readPromise;
					if (protocol.dataType === 'blob') {
						// 二进制文件（XMind, MindManager）
						readPromise = native.invoke('read_file_binary', { path: filePath }).then(function(bytes) {
							return new Blob([new Uint8Array(bytes)]);
						});
					} else {
						// 文本文件
						readPromise = native.file.read(filePath);
					}

					return readPromise.then(function(data) {
						return ProtocolManager.decode(protocolName, data);
					}).then(function(json) {
						minder.importJson(json);
						$timeout(function() {
							// 只有 .km 格式才设置文档路径
							if (setPath && protocolName === 'json') {
								documentService.setFilePath(filePath);
							} else {
								// 导入的文件不设置路径，作为新文档
								documentService.reset();
							}
							documentService.setModified(false);
						});
					});
				}

				/**
				 * 检查并处理命令行传入的文件路径
				 */
				function handleOpenFilePath(editor) {
					var filePath = window.__OPEN_FILE_PATH__;
					if (filePath && native.isTauri) {
						// 清除标记，避免重复处理
						window.__OPEN_FILE_PATH__ = null;
						
						console.log('[TyMinder] Opening file from command line:', filePath);
						
						openFile(editor, filePath, true).catch(function(e) {
							console.error('[TyMinder] Failed to open file from command line:', e);
							alert(scope.editor.lang.t('failedtoopenfile', 'ui/error') + ': ' + e.message);
						});
					}
				}

				/**
				 * 设置拖拽文件处理
				 */
				function setupDragAndDrop(editor) {
					// Tauri 2.0 使用事件系统处理文件拖拽
					if (native.isTauri && window.__TAURI__) {
						var listen = window.__TAURI__.event.listen;
						
						// 监听文件拖拽事件
						listen('tauri://drag-drop', function(event) {
							var paths = event.payload.paths;
							if (!paths || paths.length === 0) return;
							
							var filePath = paths[0];
							console.log('[TyMinder] File dropped:', filePath);
							
						// 检查是否支持该格式的导入
							var ProtocolManager = editor.ProtocolManager;
							var found = ProtocolManager ? ProtocolManager.findByExtension(filePath) : null;
							
							// 检查协议是否存在且支持导入（有 decode 方法）
							if (!found || !found.protocol.decode) {
								var ext = filePath.split('.').pop();
								alert(scope.editor.lang.t('unsupportedformat', 'ui/error') + ': .' + ext);
								return;
							}
							
							// 在新窗口中打开文件
							native.invoke('new_window', { filePath: filePath }).catch(function(e) {
								console.error('[TyMinder] Failed to open file in new window:', e);
								alert(scope.editor.lang.t('failedtoopenfile', 'ui/error') + ': ' + e);
							});
						});
						
						console.log('[TyMinder] Drag and drop listener registered');
					}
				}

				function onInit(editor, minder) {
					scope.onInit({
						editor: editor,
						minder: minder
					});

					minderService.executeCallback();
					
					// 处理命令行文件参数
					handleOpenFilePath(editor);
					
					// 设置拖拽文件处理
					setupDragAndDrop(editor);
				}

				// debug 模式，采用seajs加载
				if (typeof(seajs) != 'undefined') {
					/* global seajs */
					seajs.config({
						base: './src'
					});

					define('TyMinder', function(require) {
						var Editor = require('editor');
						var lang = config.get('lang') || 'system';

						var editor = window.editor = new Editor($minderEditor, lang);
						
						window.minder = window.km = editor.minder;

						window.editor = scope.editor = editor;
						scope.minder = minder;
						scope.config = config.get();

						//scope.minder.setDefaultOptions(scope.config);
						scope.$apply();

						onInit(editor, minder);
						
					});

					seajs.use('TyMinder');

				} else if (window.kityminder && window.kityminder.Editor) {
					// release 模式，直接载入编译好的.js文件

					var lang = config.get('lang') || 'system';
					var editor = new kityminder.Editor($minderEditor, lang);

					window.editor = scope.editor = editor;
					window.minder = scope.minder = editor.minder;

                    scope.config = config.get();

                    //scope.minder.setDefaultOptions(config.getConfig());
					scope.$apply();

                    onInit(editor, editor.minder);
                }

			}
		}
	}]);