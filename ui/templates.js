angular.module('kityminderEditor').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui/directive/aiChatPanel/aiChatPanel.html',
    "<div class=\"ai-chat-panel panel panel-default\" ng-show=\"panelOpen\"><div class=\"panel-heading\"><h3 class=\"panel-title\">{{ 'title' | lang: 'ui/aichat' }}</h3><div class=\"panel-actions\"><i class=\"glyphicon glyphicon-trash clear-btn\" ng-click=\"clearMessages()\" title=\"{{ 'clear' | lang: 'ui/aichat' }}\"></i> <i class=\"glyphicon glyphicon-remove close-btn\" ng-click=\"closePanel()\"></i></div></div><div class=\"panel-body\"><div class=\"ai-chat-not-configured\" ng-show=\"!aiConfigured\"><span class=\"glyphicon glyphicon-info-sign\"></span><p>{{ 'notconfigured' | lang: 'ui/aichat' }}</p></div><div class=\"ai-chat-messages\" ng-show=\"aiConfigured\"><div class=\"chat-message assistant\" ng-show=\"messages.length === 0\"><div class=\"message-avatar\"><span class=\"glyphicon glyphicon-flash\"></span></div><div class=\"message-content\"><p>{{ 'welcome' | lang: 'ui/aichat' }}</p></div></div><div class=\"chat-message\" ng-repeat=\"msg in messages\" ng-class=\"msg.role\"><div class=\"message-avatar\"><span class=\"glyphicon\" ng-class=\"{'glyphicon-user': msg.role === 'user', 'glyphicon-flash': msg.role === 'assistant', 'glyphicon-warning-sign': msg.role === 'error'}\"></span></div><div class=\"message-content\"><p ng-if=\"msg.role === 'user'\" ng-bind-html=\"msg.content | nl2br\"></p><div ng-if=\"msg.role !== 'user'\" class=\"markdown-body\" ng-bind-html=\"msg.content | markdown\"></div></div></div><div class=\"chat-message assistant loading\" ng-show=\"loading\"><div class=\"message-avatar\"><span class=\"glyphicon glyphicon-flash\"></span></div><div class=\"message-content\"><span class=\"typing-indicator\"><span></span><span></span><span></span></span></div></div></div><div class=\"ai-chat-input\" ng-show=\"aiConfigured\"><textarea ng-model=\"userInput\" ng-keypress=\"onKeypress($event)\" placeholder=\"{{ 'inputhint' | lang: 'ui/aichat' }}\" ng-disabled=\"loading\"></textarea><button class=\"btn btn-primary send-btn\" ng-click=\"sendMessage()\" ng-disabled=\"loading || !userInput.trim()\"><span class=\"glyphicon glyphicon-send\"></span></button></div></div></div>"
  );


  $templateCache.put('ui/directive/aiTab/aiTab.html',
    "<div class=\"ai-tab-container\"><div class=\"btn-group-vertical ai-btn-group\" ng-class=\"{'disabled': !aiConfigured}\" ng-click=\"aiConfigured && showAIGenerate()\" title=\"{{ 'aigenerate' | lang:'ui/aitab' }}\"><button type=\"button\" class=\"btn btn-default ai-icon ai-generate-icon\"></button> <button type=\"button\" class=\"btn btn-default ai-caption\"><span class=\"caption\">{{ 'aigenerate' | lang:'ui/aitab' }}</span></button></div><div class=\"btn-group-vertical ai-btn-group\" ng-class=\"{'disabled': !aiConfigured}\" ng-click=\"aiConfigured && showAIChat()\" title=\"{{ 'aichat' | lang:'ui/aitab' }}\"><button type=\"button\" class=\"btn btn-default ai-icon ai-chat-icon\"></button> <button type=\"button\" class=\"btn btn-default ai-caption\"><span class=\"caption\">{{ 'aichat' | lang:'ui/aitab' }}</span></button></div><div class=\"btn-group-vertical ai-btn-group\" ng-class=\"{'disabled': !aiConfigured}\" ng-click=\"aiConfigured && showAIExportArticle()\" title=\"{{ 'aiexportarticle' | lang:'ui/aitab' }}\"><button type=\"button\" class=\"btn btn-default ai-icon ai-export-article-icon\"></button> <button type=\"button\" class=\"btn btn-default ai-caption\"><span class=\"caption\">{{ 'aiexportarticle' | lang:'ui/aitab' }}</span></button></div><div class=\"btn-group-vertical ai-btn-group\" ng-class=\"{'disabled': !aiConfigured}\" ng-click=\"aiConfigured && showAIExportReport()\" title=\"{{ 'aiexportreport' | lang:'ui/aitab' }}\"><button type=\"button\" class=\"btn btn-default ai-icon ai-export-report-icon\"></button> <button type=\"button\" class=\"btn btn-default ai-caption\"><span class=\"caption\">{{ 'aiexportreport' | lang:'ui/aitab' }}</span></button></div><div class=\"btn-group-vertical ai-btn-group\" ng-class=\"{'disabled': !aiConfigured}\" ng-click=\"aiConfigured && showAIExportPPT()\" title=\"{{ 'aiexportppt' | lang:'ui/aitab' }}\"><button type=\"button\" class=\"btn btn-default ai-icon ai-export-ppt-icon\"></button> <button type=\"button\" class=\"btn btn-default ai-caption\"><span class=\"caption\">{{ 'aiexportppt' | lang:'ui/aitab' }}</span></button></div><div class=\"ai-config-hint\" ng-show=\"!aiConfigured\"><span class=\"glyphicon glyphicon-info-sign\"></span> <span>{{ 'notconfigured' | lang:'ui/aitab' }}</span></div></div>"
  );


  $templateCache.put('ui/directive/appendNode/appendNode.html',
    "<div class=\"km-btn-group append-group\"><div class=\"km-btn-item append-child-node\" ng-disabled=\"minder.queryCommandState('AppendChildNode') === -1\" ng-click=\"minder.queryCommandState('AppendChildNode') === -1 || execCommand('AppendChildNode')\" title=\"{{ 'appendchildnode' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'appendchildnode' | lang:'ui/command' }}</span></div><div class=\"km-btn-item append-parent-node\" ng-disabled=\"minder.queryCommandState('AppendParentNode') === -1\" ng-click=\"minder.queryCommandState('AppendParentNode') === -1 || execCommand('AppendParentNode')\" title=\"{{ 'appendparentnode' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'appendparentnode' | lang:'ui/command' }}</span></div><div class=\"km-btn-item append-sibling-node\" ng-disabled=\"minder.queryCommandState('AppendSiblingNode') === -1\" ng-click=\"minder.queryCommandState('AppendSiblingNode') === -1 ||execCommand('AppendSiblingNode')\" title=\"{{ 'appendsiblingnode' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'appendsiblingnode' | lang:'ui/command' }}</span></div></div>"
  );


  $templateCache.put('ui/directive/arrange/arrange.html',
    "<div class=\"km-btn-group arrange-group\"><div class=\"km-btn-item arrange-up\" ng-disabled=\"minder.queryCommandState('ArrangeUp') === -1\" ng-click=\"minder.queryCommandState('ArrangeUp') === -1 || minder.execCommand('ArrangeUp')\" title=\"{{ 'arrangeup' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'arrangeup' | lang:'ui/command' }}</span></div><div class=\"km-btn-item arrange-down\" ng-disabled=\"minder.queryCommandState('ArrangeDown') === -1\" ng-click=\"minder.queryCommandState('ArrangeDown') === -1 || minder.execCommand('ArrangeDown');\" title=\"{{ 'arrangedown' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'arrangedown' | lang:'ui/command' }}</span></div></div>"
  );


  $templateCache.put('ui/directive/colorPanel/colorPanel.html',
    "<div class=\"bg-color-wrap\" title=\"{{ 'color' | lang:'panels' }}\"><span class=\"quick-bg-color\" ng-click=\"minder.queryCommandState('background') === -1 || minder.execCommand('background', bgColor)\" ng-disabled=\"minder.queryCommandState('background') === -1\"></span> <span color-picker class=\"bg-color\" set-color=\"setDefaultBg()\" ng-disabled=\"minder.queryCommandState('background') === -1\"><span class=\"caret\"></span></span> <span class=\"bg-color-preview\" ng-style=\"{ 'background-color': bgColor }\" ng-click=\"minder.queryCommandState('background') === -1 || minder.execCommand('background', bgColor)\" ng-disabled=\"minder.queryCommandState('background') === -1\"></span></div>"
  );


  $templateCache.put('ui/directive/contextMenu/contextMenu.html',
    "<div class=\"km-context-menu\" ng-show=\"visible\" ng-style=\"{'left': menuX + 'px', 'top': menuY + 'px'}\"><ul class=\"menu-list\"><li ng-repeat=\"item in menuItems track by $index\" ng-if=\"(item.id !== 'ai' && item.id !== 'separator_before_ai') || aiConfigured\" ng-class=\"{\r" +
    "\n" +
    "                'separator': item.type === 'separator',\r" +
    "\n" +
    "                'has-submenu': item.submenu,\r" +
    "\n" +
    "                'active': activeSubmenu === item.id,\r" +
    "\n" +
    "                'disabled': isDisabled(item)\r" +
    "\n" +
    "            }\" ng-mouseenter=\"onItemEnter(item, $event)\" ng-click=\"onItemClick(item, $event)\"><div ng-if=\"item.type === 'separator'\" class=\"separator-line\"></div><div ng-if=\"item.type !== 'separator'\" class=\"menu-item-content\"><span class=\"menu-icon\"><i ng-if=\"item.icon && item.icon.indexOf('glyphicon') === 0\" class=\"glyphicon {{item.icon}}\"></i> <span ng-if=\"item.icon && item.icon.indexOf('priority-') === 0\" class=\"{{item.icon}}\"></span> <span ng-if=\"item.icon && item.icon.indexOf('progress-') === 0\" class=\"{{item.icon}}\"></span></span> <span class=\"menu-label\">{{item.label}}</span> <span class=\"menu-shortcut\">{{item.shortcut}}</span> <span ng-if=\"item.submenu\" class=\"submenu-arrow\">▶</span></div><ul ng-if=\"item.submenu && activeSubmenu === item.id\" class=\"submenu\" ng-style=\"submenuStyle\"><li ng-repeat=\"subItem in item.submenu track by $index\" ng-class=\"{\r" +
    "\n" +
    "                        'separator': subItem.type === 'separator',\r" +
    "\n" +
    "                        'has-submenu': subItem.submenu,\r" +
    "\n" +
    "                        'active': activeSubmenu2 === subItem.id\r" +
    "\n" +
    "                    }\" ng-mouseenter=\"onSubmenuItemEnter(subItem, $event)\" ng-click=\"onItemClick(subItem, $event)\"><div ng-if=\"subItem.type === 'separator'\" class=\"separator-line\"></div><div ng-if=\"subItem.type !== 'separator'\" class=\"menu-item-content\"><span class=\"menu-icon\"><i ng-if=\"subItem.icon && subItem.icon.indexOf('glyphicon') === 0\" class=\"glyphicon {{subItem.icon}}\"></i> <span ng-if=\"subItem.icon && subItem.icon.indexOf('priority-icon') === 0\" class=\"{{subItem.icon}}\"></span> <span ng-if=\"subItem.icon && subItem.icon.indexOf('progress-icon') === 0\" class=\"{{subItem.icon}}\"></span></span> <span class=\"menu-label\">{{subItem.label}}</span> <span class=\"menu-shortcut\">{{subItem.shortcut}}</span> <span ng-if=\"subItem.submenu\" class=\"submenu-arrow\">▶</span></div><ul ng-if=\"subItem.submenu && activeSubmenu2 === subItem.id\" class=\"submenu\" ng-style=\"submenu2Style\"><li ng-repeat=\"subItem2 in subItem.submenu track by $index\" ng-class=\"{'separator': subItem2.type === 'separator'}\" ng-click=\"onItemClick(subItem2, $event)\"><div ng-if=\"subItem2.type === 'separator'\" class=\"separator-line\"></div><div ng-if=\"subItem2.type !== 'separator'\" class=\"menu-item-content\"><span class=\"menu-icon\"><i ng-if=\"subItem2.icon && subItem2.icon.indexOf('glyphicon') === 0\" class=\"glyphicon {{subItem2.icon}}\"></i></span> <span class=\"menu-label\">{{subItem2.label}}</span> <span class=\"menu-shortcut\">{{subItem2.shortcut}}</span></div></li></ul></li></ul></li></ul></div>"
  );


  $templateCache.put('ui/directive/expandLevel/expandLevel.html',
    "<div class=\"btn-group-vertical\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default expand\" title=\"{{ 'expandtoleaf' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"minder.execCommand('ExpandToLevel', 9999)\"></button> <button type=\"button\" class=\"btn btn-default expand-caption dropdown-toggle\" title=\"{{ 'expandtoleaf' | lang:'ui' }}\" uib-dropdown-toggle><span class=\"caption\">{{ 'expandtoleaf' | lang:'ui' }}</span> <span class=\"caret\"></span> <span class=\"sr-only\">{{ 'expandtoleaf' | lang:'ui' }}</span></button><ul class=\"dropdown-menu\" role=\"menu\"><li ng-repeat=\"level in levels\"><a href ng-click=\"minder.execCommand('ExpandToLevel', level)\">{{ 'expandtolevel' + level | lang:'ui/command' }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/fileOperation/fileOperation.html',
    "<div class=\"file-operation-overlay\"><div class=\"file-menu-sidebar\"><div class=\"file-menu-back-btn\" ng-click=\"exit()\" title=\"Back\"><span class=\"glyphicon glyphicon-arrow-left\"></span></div><div class=\"file-menu-item\" ng-click=\"newFile()\"><span class=\"glyphicon glyphicon-file\"></span> {{ 'new' | lang: 'ui/file' }}</div><div class=\"file-menu-item file-menu-item-expandable\" ng-class=\"{'active': activeMenu === 'recent'}\"><span class=\"item-main\" ng-click=\"openFile()\"><span class=\"glyphicon glyphicon-folder-open\"></span> {{ 'open' | lang: 'ui/file' }}</span> <span class=\"item-arrow\" ng-click=\"showRecent(); $event.stopPropagation()\" title=\"{{ 'recentfiles' | lang: 'ui/file' }}\"><span class=\"glyphicon glyphicon-chevron-right\"></span></span></div><div class=\"file-menu-item\" ng-click=\"saveFile()\"><span class=\"glyphicon glyphicon-floppy-disk\"></span> {{ 'save' | lang: 'ui/file' }}</div><div class=\"file-menu-item\" ng-click=\"saveAsFile()\"><span class=\"glyphicon glyphicon-floppy-save\"></span> {{ 'saveas' | lang: 'ui/file' }}</div><div class=\"file-menu-item\" ng-class=\"{'active': activeMenu === 'info'}\" ng-click=\"showInfo()\"><span class=\"glyphicon glyphicon-list-alt\"></span> {{ 'info' | lang: 'ui/file' }}</div><div class=\"file-menu-separator\"></div><div class=\"file-menu-item\" ng-class=\"{'active': activeMenu === 'import'}\" ng-click=\"showImport()\"><span class=\"glyphicon glyphicon-import\"></span> {{ 'import' | lang: 'ui/file' }}</div><div class=\"file-menu-item\" ng-class=\"{'active': activeMenu === 'export'}\" ng-click=\"showExport()\"><span class=\"glyphicon glyphicon-export\"></span> {{ 'export' | lang: 'ui/file' }}</div><div class=\"file-menu-separator\"></div><div class=\"file-menu-item\" ng-click=\"showSettings()\"><span class=\"glyphicon glyphicon-cog\"></span> {{ 'settings' | lang: 'ui/file' }}</div><div class=\"file-menu-item\" ng-class=\"{'active': activeMenu === 'about'}\" ng-click=\"showAbout()\"><span class=\"glyphicon glyphicon-info-sign\"></span> {{ 'about' | lang: 'ui/file' }}</div></div><div class=\"file-menu-content\" ng-show=\"activeMenu === 'info'\"><h2 class=\"file-menu-title\">{{ 'title' | lang: 'ui/fileinfo' }}</h2><div class=\"file-info-list\"><div class=\"file-info-item\"><span class=\"file-info-label\">{{ 'filename' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value\">{{fileInfo.fileName || '-'}}</span></div><div class=\"file-info-item\" ng-if=\"!fileInfo.isNewFile\"><span class=\"file-info-label\">{{ 'path' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value file-path\" title=\"{{fileInfo.filePath}}\">{{fileInfo.filePath}}</span></div><div class=\"file-info-item\" ng-if=\"!fileInfo.isNewFile\"><span class=\"file-info-label\">{{ 'size' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value\">{{fileInfo.fileSize || '-'}}</span></div><div class=\"file-info-item\" ng-if=\"!fileInfo.isNewFile\"><span class=\"file-info-label\">{{ 'created' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value\">{{fileInfo.createdTime || '-'}}</span></div><div class=\"file-info-item\" ng-if=\"!fileInfo.isNewFile\"><span class=\"file-info-label\">{{ 'modified' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value\">{{fileInfo.modifiedTime || '-'}}</span></div><div class=\"file-info-item\" ng-if=\"fileInfo.isNewFile\"><span class=\"file-info-hint\">{{ 'newfilehint' | lang: 'ui/fileinfo' }}</span></div><div class=\"file-info-section\" ng-if=\"backupEnabled\"><div class=\"file-info-section-title\">{{ 'backupinfo' | lang: 'ui/fileinfo' }}</div><div class=\"file-info-item\"><span class=\"file-info-label\">{{ 'backupcount' | lang: 'ui/fileinfo' }}</span> <span class=\"file-info-value\">{{backupInfo.count || 0}}</span></div><div class=\"file-info-item\"><span class=\"file-info-label\">{{ 'backupsize' | lang: 'ui/dialog/settings' }}</span> <span class=\"file-info-value file-info-link\" ng-click=\"openBackupDir()\">{{backupInfo.sizeDisplay || '0 B'}}</span></div></div></div></div><div class=\"file-menu-content\" ng-show=\"activeMenu === 'import'\"><h2 class=\"file-menu-title\">{{ 'import' | lang: 'ui/file' }}</h2><p class=\"file-menu-desc\">{{ 'importdesc' | lang: 'ui/file' }}</p><div class=\"format-list\"><div class=\"format-item\" ng-repeat=\"fmt in importFormats\" ng-click=\"doImport(fmt)\"><span class=\"format-icon glyphicon\" ng-class=\"fmt.icon\"></span><div class=\"format-info\"><div class=\"format-name\">{{fmt.name}}</div><div class=\"format-ext\">{{fmt.extensions}}</div></div></div></div></div><div class=\"file-menu-content\" ng-show=\"activeMenu === 'export'\"><h2 class=\"file-menu-title\">{{ 'export' | lang: 'ui/file' }}</h2><p class=\"file-menu-desc\">{{ 'exportdesc' | lang: 'ui/file' }}</p><div class=\"format-list\"><div class=\"format-item\" ng-repeat=\"fmt in exportFormats\" ng-click=\"doExport(fmt)\"><span class=\"format-icon glyphicon\" ng-class=\"fmt.icon\"></span><div class=\"format-info\"><div class=\"format-name\">{{fmt.name}}</div><div class=\"format-ext\">{{fmt.extensions}}</div></div></div></div></div><div class=\"file-menu-content\" ng-show=\"activeMenu === 'about'\"><h2 class=\"file-menu-title\">{{ 'about' | lang: 'ui/file' }}</h2><div class=\"about-content\"><h3 class=\"about-app-name\">TyMinder</h3><p class=\"about-version\">{{ 'version' | lang: 'ui/about' }}: {{appVersion}}</p><p class=\"about-desc\">{{ 'desc' | lang: 'ui/about' }}</p><p class=\"about-website\"><a href=\"https://github.com/ACTom/TyMinder\" target=\"_blank\">{{ 'website' | lang: 'ui/about' }}</a></p><p class=\"about-copyright\">© 2025 <a href=\"https://github.com/ACTom\" target=\"_blank\">ACTom</a> {{ 'copyright' | lang: 'ui/about' }}</p></div></div><div class=\"file-menu-content\" ng-show=\"activeMenu === 'recent'\"><div class=\"file-menu-title-bar\"><h2 class=\"file-menu-title\">{{ 'recentfiles' | lang: 'ui/file' }}</h2><button class=\"btn-clear-history\" ng-click=\"clearRecentFiles()\" ng-show=\"recentFiles.length > 0\" title=\"{{ 'clearhistory' | lang: 'ui/file' }}\"><span class=\"glyphicon glyphicon-trash\"></span></button></div><div class=\"recent-file-list\" ng-show=\"recentFiles.length > 0\"><div class=\"recent-file-item\" ng-repeat=\"file in recentFiles\" ng-click=\"openRecentFile(file)\" title=\"{{file.path}}\"><span class=\"recent-file-icon glyphicon glyphicon-file\"></span><div class=\"recent-file-info\"><div class=\"recent-file-name\">{{file.name}}</div><div class=\"recent-file-path\">{{file.path}}</div></div></div></div><div class=\"recent-file-empty\" ng-show=\"recentFiles.length === 0\"><span class=\"glyphicon glyphicon-folder-open\"></span><p>{{ 'norecentfiles' | lang: 'ui/file' }}</p></div></div></div>"
  );


  $templateCache.put('ui/directive/fontOperator/fontOperator.html',
    "<div class=\"font-operator\"><div class=\"dropdown font-family-list\" uib-dropdown><div class=\"dropdown-toggle current-font-item\" uib-dropdown-toggle ng-disabled=\"minder.queryCommandState('fontfamily') === -1\"><a href class=\"current-font-family\" title=\"{{ 'fontfamily' | lang: 'ui' }}\">{{ getFontfamilyName(minder.queryCommandValue('fontfamily')) || lang('fontfamily', 'ui') }}</a> <span class=\"caret\"></span></div><ul class=\"dropdown-menu font-list\"><li ng-repeat=\"f in fontFamilyList\" class=\"font-item-wrap\"><a ng-click=\"minder.execCommand('fontfamily', f.val)\" class=\"font-item\" ng-class=\"{ 'font-item-selected' : f == minder.queryCommandValue('fontfamily') }\" ng-style=\"{'font-family': f.val }\">{{ f.name }}</a></li></ul></div><div class=\"dropdown font-size-list\" uib-dropdown><div class=\"dropdown-toggle current-font-item\" uib-dropdown-toggle ng-disabled=\"minder.queryCommandState('fontsize') === -1\"><a href class=\"current-font-size\" title=\"{{ 'fontsize' | lang: 'ui' }}\">{{ minder.queryCommandValue('fontsize') || lang('fontsize', 'ui') }}</a> <span class=\"caret\"></span></div><ul class=\"dropdown-menu font-list\"><li ng-repeat=\"f in fontSizeList\" class=\"font-item-wrap\"><a ng-click=\"minder.execCommand('fontsize', f)\" class=\"font-item\" ng-class=\"{ 'font-item-selected' : f == minder.queryCommandValue('fontsize') }\" ng-style=\"{'font-size': f + 'px'}\">{{ f }}</a></li></ul></div><span class=\"s-btn-icon font-bold\" title=\"{{ 'bold' | lang: 'ui' }}\" ng-click=\"minder.queryCommandState('bold') === -1 || minder.execCommand('bold')\" ng-class=\"{'font-bold-selected' : minder.queryCommandState('bold') == 1}\" ng-disabled=\"minder.queryCommandState('bold') === -1\"></span> <span class=\"s-btn-icon font-italics\" title=\"{{ 'italic' | lang: 'ui' }}\" ng-click=\"minder.queryCommandState('italic') === -1 || minder.execCommand('italic')\" ng-class=\"{'font-italics-selected' : minder.queryCommandState('italic') == 1}\" ng-disabled=\"minder.queryCommandState('italic') === -1\"></span><div class=\"font-color-wrap\" title=\"{{ 'forecolor' | lang: 'ui'}}\"><span class=\"quick-font-color\" ng-click=\"minder.queryCommandState('forecolor') === -1 || minder.execCommand('forecolor', foreColor)\" ng-disabled=\"minder.queryCommandState('forecolor') === -1\">A</span> <span color-picker class=\"font-color\" set-color=\"setDefaultColor()\" ng-disabled=\"minder.queryCommandState('forecolor') === -1\"><span class=\"caret\"></span></span> <span class=\"font-color-preview\" ng-style=\"{ 'background-color': foreColor }\" ng-click=\"minder.queryCommandState('forecolor') === -1 || minder.execCommand('forecolor', foreColor)\" ng-disabled=\"minder.queryCommandState('forecolor') === -1\"></span></div><color-panel minder=\"minder\" class=\"inline-directive\"></color-panel></div>"
  );


  $templateCache.put('ui/directive/hyperLink/hyperLink.html',
    "<div class=\"btn-group-vertical\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default hyperlink\" title=\"{{ 'link' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"addHyperlink()\" ng-disabled=\"minder.queryCommandState('HyperLink') === -1\"></button> <button type=\"button\" class=\"btn btn-default hyperlink-caption dropdown-toggle\" ng-disabled=\"minder.queryCommandState('HyperLink') === -1\" title=\"{{ 'link' | lang:'ui' }}\" uib-dropdown-toggle><span class=\"caption\">{{ 'link' | lang:'ui' }}</span> <span class=\"caret\"></span> <span class=\"sr-only\">{{ 'link' | lang:'ui' }}</span></button><ul class=\"dropdown-menu\" role=\"menu\"><li><a href ng-click=\"addHyperlink()\">{{ 'insertlink' | lang:'ui' }}</a></li><li><a href ng-click=\"minder.execCommand('HyperLink', null)\">{{ 'removelink' | lang:'ui' }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/imageBtn/imageBtn.html',
    "<div class=\"btn-group-vertical\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default image-btn\" title=\"{{ 'image' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"addImage()\" ng-disabled=\"minder.queryCommandState('Image') === -1\"></button> <button type=\"button\" class=\"btn btn-default image-btn-caption dropdown-toggle\" ng-disabled=\"minder.queryCommandState('Image') === -1\" title=\"{{ 'image' | lang:'ui' }}\" uib-dropdown-toggle><span class=\"caption\">{{ 'image' | lang:'ui' }}</span> <span class=\"caret\"></span> <span class=\"sr-only\">{{ 'image' | lang:'ui' }}</span></button><ul class=\"dropdown-menu\" role=\"menu\"><li><a href ng-click=\"addImage()\">{{ 'insertimage' | lang:'ui' }}</a></li><li><a href ng-click=\"minder.execCommand('Image', '')\">{{ 'removeimage' | lang:'ui' }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/kityminderEditor/kityminderEditor.html',
    "<div class=\"minder-editor-container\"><div class=\"top-tab\" top-tab=\"minder\" editor=\"editor\" ng-if=\"minder\"></div><div search-box minder=\"minder\" ng-if=\"minder\"></div><div class=\"minder-editor\"></div><div class=\"km-note\" note-editor minder=\"minder\" ng-if=\"minder\"></div><div class=\"ai-chat-panel-container\" ai-chat-panel minder=\"minder\" ng-if=\"minder\"></div><div class=\"note-previewer\" note-previewer ng-if=\"minder\"></div><div class=\"navigator\" navigator minder=\"minder\" ng-if=\"minder\"></div><context-menu minder=\"minder\" ng-if=\"minder\"></context-menu><div class=\"ai-rewrite-overlay\" ai-rewrite-overlay ng-if=\"minder\"></div></div>"
  );


  $templateCache.put('ui/directive/kityminderViewer/kityminderViewer.html',
    "<div class=\"minder-editor-container\"><div class=\"minder-viewer\"></div><div class=\"note-previewer\" note-previewer ng-if=\"minder\"></div><div class=\"navigator\" navigator minder=\"minder\" ng-if=\"minder\"></div></div>"
  );


  $templateCache.put('ui/directive/layout/layout.html',
    "<div class=\"readjust-layout\"><a ng-click=\"minder.queryCommandState('resetlayout') === -1 || minder.execCommand('resetlayout')\" class=\"btn-wrap\" ng-disabled=\"minder.queryCommandState('resetlayout') === -1\"><span class=\"btn-icon reset-layout-icon\"></span> <span class=\"btn-label\">{{ 'resetlayout' | lang: 'ui/command' }}</span></a></div>"
  );


  $templateCache.put('ui/directive/navigator/navigator.html',
    "<div class=\"nav-bar\"><div class=\"nav-btn zoom-in\" ng-click=\"minder.execCommand('zoomIn')\" title=\"{{ 'zoom-in' | lang : 'ui' }}\" ng-class=\"{ 'active' : getZoomRadio(zoom) == 0 }\"><div class=\"icon\"></div></div><div class=\"zoom-pan\"><div class=\"origin\" ng-style=\"{'transform': 'translate(0, ' + getHeight(100) + 'px)'}\" ng-click=\"minder.execCommand('zoom', 100);\"></div><div class=\"indicator\" ng-style=\"{\n" +
    "             'transform': 'translate(0, ' + getHeight(zoom) + 'px)',\n" +
    "             'transition': 'transform 200ms'\n" +
    "             }\"></div></div><div class=\"nav-btn zoom-out\" ng-click=\"minder.execCommand('zoomOut')\" title=\"{{ 'zoom-out' | lang : 'ui' }}\" ng-class=\"{ 'active' : getZoomRadio(zoom) == 1 }\"><div class=\"icon\"></div></div><div class=\"nav-btn hand\" ng-click=\"minder.execCommand('hand')\" title=\"{{ 'hand' | lang : 'ui' }}\" ng-class=\"{ 'active' : minder.queryCommandState('hand') == 1 }\"><div class=\"icon\"></div></div><div class=\"nav-btn camera\" ng-click=\"minder.execCommand('camera', minder.getRoot(), 600);\" title=\"{{ 'camera' | lang : 'ui' }}\"><div class=\"icon\"></div></div><div class=\"nav-btn nav-trigger\" ng-class=\"{'active' : isNavOpen}\" ng-click=\"toggleNavOpen()\" title=\"{{ 'navigator' | lang : 'ui' }}\"><div class=\"icon\"></div></div></div><div class=\"nav-previewer\" ng-show=\"isNavOpen\"></div>"
  );


  $templateCache.put('ui/directive/noteBtn/noteBtn.html',
    "<div class=\"btn-group-vertical note-btn-group\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default note-btn\" title=\"{{ 'note' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"addNote()\" ng-disabled=\"minder.queryCommandState('note') === -1\"></button> <button type=\"button\" class=\"btn btn-default note-btn-caption dropdown-toggle\" ng-disabled=\"minder.queryCommandState('note') === -1\" title=\"{{ 'note' | lang:'ui' }}\" uib-dropdown-toggle><span class=\"caption\">{{ 'note' | lang:'ui' }}</span> <span class=\"caret\"></span> <span class=\"sr-only\">{{ 'note' | lang:'ui' }}</span></button><ul class=\"dropdown-menu\" role=\"menu\"><li><a href ng-click=\"addNote()\">{{ 'insertnote' | lang:'ui' }}</a></li><li><a href ng-click=\"minder.execCommand('note', null)\">{{ 'removenote' | lang:'ui' }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/noteEditor/noteEditor.html',
    "<div class=\"panel panel-default\" ng-init=\"noteEditorOpen = false\" ng-show=\"noteEditorOpen\"><div class=\"panel-heading\"><h3 class=\"panel-title\">{{ 'title' | lang: 'ui/noteeditor' }}</h3><span>（<a class=\"help\" href=\"https://www.zybuluo.com/techird/note/46064\" target=\"_blank\">{{ 'hint' | lang: 'ui/noteeditor' }}</a>）</span> <i class=\"close-note-editor glyphicon glyphicon-remove\" ng-click=\"closeNoteEditor()\"></i></div><div class=\"panel-body\"><div ng-show=\"noteEnabled\" ui-codemirror=\"{ onLoad: codemirrorLoaded }\" ng-model=\"noteContent\" ui-codemirror-opts=\"{\n" +
    "                gfm: true,\n" +
    "                breaks: true,\n" +
    "                lineWrapping : true,\n" +
    "                mode: 'gfm',\n" +
    "                dragDrop: false,\n" +
    "                lineNumbers:true\n" +
    "             }\"></div><p ng-show=\"!noteEnabled\" class=\"km-note-tips\">{{ 'placeholder' | lang: 'ui/noteeditor' }}</p></div></div>"
  );


  $templateCache.put('ui/directive/notePreviewer/notePreviewer.html',
    "<div id=\"previewer-content\" ng-show=\"showNotePreviewer\" ng-style=\"previewerStyle\" ng-bind-html=\"noteContent\"></div>"
  );


  $templateCache.put('ui/directive/operation/operation.html',
    "<div class=\"km-btn-group operation-group\"><div class=\"km-btn-item edit-node\" ng-disabled=\"minder.queryCommandState('text') === -1\" ng-click=\"minder.queryCommandState('text') === -1 || editNode()\" title=\"{{ 'editnode' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'editnode' | lang:'ui/command' }}</span></div><div class=\"km-btn-item remove-node\" ng-disabled=\"minder.queryCommandState('RemoveNode') === -1\" ng-click=\"minder.queryCommandState('RemoveNode') === -1 || minder.execCommand('RemoveNode');\" title=\"{{ 'removenode' | lang:'ui/command' }}\"><i class=\"km-btn-icon\"></i> <span class=\"km-btn-caption\">{{ 'removenode' | lang:'ui/command' }}</span></div></div>"
  );


  $templateCache.put('ui/directive/priorityEditor/priorityEditor.html',
    "<ul class=\"km-priority tool-group\" ng-disabled=\"commandDisabled\"><li class=\"km-priority-item tool-group-item\" ng-repeat=\"p in priorities\" ng-click=\"commandDisabled || minder.execCommand('priority', p)\" ng-class=\"{ active: commandValue == p }\" title=\"{{ getPriorityTitle(p) }}\"><div class=\"km-priority-icon tool-group-icon priority-{{p}}\"></div></li></ul>"
  );


  $templateCache.put('ui/directive/progressEditor/progressEditor.html',
    "<ul class=\"km-progress tool-group\" ng-disabled=\"commandDisabled\"><li class=\"km-progress-item tool-group-item\" ng-repeat=\"p in progresses\" ng-click=\"commandDisabled || minder.execCommand('progress', p)\" ng-class=\"{ active: commandValue == p }\" title=\"{{ getProgressTitle(p) }}\"><div class=\"km-progress-icon tool-group-icon progress-{{p}}\"></div></li></ul>"
  );


  $templateCache.put('ui/directive/resourceEditor/resourceEditor.html',
    "<div class=\"resource-editor\"><div class=\"input-group\"><input class=\"form-control\" type=\"text\" ng-model=\"newResourceName\" ng-required ng-keypress=\"$event.keyCode == 13 && addResource(newResourceName)\" ng-disabled=\"!enabled\"> <span class=\"input-group-btn\"><button class=\"btn btn-default\" ng-click=\"addResource(newResourceName)\" ng-disabled=\"!enabled\">{{ 'add' | lang: 'ui/resource'; }}</button></span></div><div class=\"resource-dropdown clearfix\" id=\"resource-dropdown\"><ul class=\"km-resource\" ng-init=\"resourceListOpen = false\" ng-class=\"{'open': resourceListOpen}\"><li ng-repeat=\"resource in used\" ng-disabled=\"!enabled\" ng-blur=\"blurCB()\"><label style=\"background: {{resourceColor(resource.name)}}\"><input type=\"checkbox\" ng-model=\"resource.selected\" ng-disabled=\"!enabled\"> <span>{{resource.name}}</span></label></li></ul><div class=\"resource-caret\" click-anywhere-but-here=\"resourceListOpen = false\" is-active=\"resourceListOpen\" ng-click=\"resourceListOpen = !resourceListOpen\"><span class=\"caret\"></span></div></div></div>"
  );


  $templateCache.put('ui/directive/searchBox/searchBox.html',
    "<div id=\"search\" class=\"search-box clearfix\" ng-show=\"showSearch\"><div class=\"input-group input-group-sm search-input-wrap\"><input type=\"text\" id=\"search-input\" class=\"form-control search-input\" ng-model=\"keyword\" ng-keydown=\"handleKeyDown($event)\" aria-describedby=\"basic-addon2\"> <span class=\"input-group-addon search-addon\" id=\"basic-addon2\" ng-show=\"showTip\" ng-bind=\"'{{ 'result' | lang:'ui/dialog/search' }}' + ' ' + curIndex + ' ' + '{{ 'on' | lang:'ui/dialog/search' }}' + ' ' +resultNum \"></span></div><div class=\"btn-group btn-group-sm prev-and-next-btn\" role=\"group\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"doSearch(keyword, 'prev')\"><span class=\"glyphicon glyphicon-chevron-up\"></span></button> <button type=\"button\" class=\"btn btn-default\" ng-click=\"doSearch(keyword, 'next')\"><span class=\"glyphicon glyphicon-chevron-down\"></span></button></div><div class=\"close-search\" ng-click=\"exitSearch()\"><span class=\"glyphicon glyphicon-remove\"></span></div></div>"
  );


  $templateCache.put('ui/directive/searchBtn/searchBtn.html',
    "<div class=\"btn-group-vertical\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default search\" title=\"{{ 'search' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"enterSearch()\"></button> <button type=\"button\" class=\"btn btn-default search-caption dropdown-toggle\" ng-click=\"enterSearch()\" title=\"{{ 'search' | lang:'ui' }}\"><span class=\"caption\">{{ 'search' | lang:'ui' }}</span> <span class=\"sr-only\">{{ 'search' | lang:'ui' }}</span></button></div>"
  );


  $templateCache.put('ui/directive/selectAll/selectAll.html',
    "<div class=\"btn-group-vertical\" uib-dropdown uib-is-open=\"isopen\"><button type=\"button\" class=\"btn btn-default select\" title=\"{{ 'selectall' | lang:'ui' }}\" ng-class=\"{'active': isopen}\" ng-click=\"select['all']()\"></button> <button type=\"button\" class=\"btn btn-default select-caption dropdown-toggle\" title=\"{{ 'selectall' | lang:'ui' }}\" uib-dropdown-toggle><span class=\"caption\">{{ 'selectall' | lang:'ui' }}</span> <span class=\"caret\"></span> <span class=\"sr-only\">{{ 'selectall' | lang:'ui' }}</span></button><ul class=\"dropdown-menu\" role=\"menu\"><li ng-repeat=\"item in items\"><a href ng-click=\"select[item]()\">{{ 'select' + item | lang:'ui' }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/styleOperator/styleOperator.html',
    "<div class=\"style-operator\"><a ng-click=\"minder.queryCommandState('clearstyle') === -1 || minder.execCommand('clearstyle')\" class=\"btn-wrap clear-style\" ng-disabled=\"minder.queryCommandState('clearstyle') === -1\"><span class=\"btn-icon clear-style-icon\"></span> <span class=\"btn-label\">{{ 'clearstyle' | lang: 'ui' }}</span></a><div class=\"s-btn-group-vertical\"><a class=\"s-btn-wrap\" href ng-click=\"minder.queryCommandState('copystyle') === -1 || minder.execCommand('copystyle')\" ng-disabled=\"minder.queryCommandState('copystyle') === -1\"><span class=\"s-btn-icon copy-style-icon\"></span> <span class=\"s-btn-label\">{{ 'copystyle' | lang: 'ui' }}</span></a> <a class=\"s-btn-wrap paste-style-wrap\" href ng-click=\"minder.queryCommandState('pastestyle') === -1 || minder.execCommand('pastestyle')\" ng-disabled=\"minder.queryCommandState('pastestyle') === -1\"><span class=\"s-btn-icon paste-style-icon\"></span> <span class=\"s-btn-label\">{{ 'pastestyle' | lang: 'ui' }}</span></a></div></div>"
  );


  $templateCache.put('ui/directive/templateList/templateList.html',
    "<div class=\"dropdown temp-panel\" uib-dropdown on-toggle=\"toggled(open)\"><div class=\"dropdown-toggle current-temp-item\" ng-disabled=\"minder.queryCommandState('template') === -1\" uib-dropdown-toggle><a href class=\"temp-item {{ minder.queryCommandValue('template') }}\" title=\"{{ minder.queryCommandValue('template') | lang: 'template' }}\"></a> <span class=\"caret\"></span></div><ul class=\"dropdown-menu temp-list\"><li ng-repeat=\"(key, templateObj) in templateList\" class=\"temp-item-wrap\"><a ng-click=\"minder.execCommand('template', key);\" class=\"temp-item {{key}}\" ng-class=\"{ 'temp-item-selected' : key == minder.queryCommandValue('template') }\" title=\"{{ key | lang: 'template' }}\"></a></li></ul></div>"
  );


  $templateCache.put('ui/directive/themeList/themeList.html',
    "<div class=\"dropdown theme-panel\" uib-dropdown><div class=\"dropdown-toggle theme-item-selected\" uib-dropdown-toggle ng-disabled=\"minder.queryCommandState('theme') === -1\"><a href class=\"theme-item\" ng-style=\"getThemeThumbStyle(minder.queryCommandValue('theme'))\" title=\"{{ minder.queryCommandValue('theme') | lang: 'theme'; }}\">{{ minder.queryCommandValue('theme') | lang: 'theme'; }}</a> <span class=\"caret\"></span></div><ul class=\"dropdown-menu theme-list\"><li ng-repeat=\"key in themeKeyList\" class=\"theme-item-wrap\"><a ng-click=\"minder.execCommand('theme', key);\" class=\"theme-item\" ng-style=\"getThemeThumbStyle(key)\" title=\"{{ key | lang: 'theme'; }}\">{{ key | lang: 'theme'; }}</a></li></ul></div>"
  );


  $templateCache.put('ui/directive/topTab/topTab.html',
    "<div class=\"window-controls-container\" style=\"position: absolute; top: 0; right: 0; left: 0; height: 32px; z-index: 10000; display: flex; justify-content: flex-end; align-items: flex-start; pointer-events: none\"><div class=\"window-drag-region\" data-tauri-drag-region style=\"position: absolute; top: 0; left: 280px; right: 120px; height: 32px; pointer-events: auto; display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(255,255,255,0.9); cursor: default; user-select: none\">{{getTitle()}}</div><div style=\"pointer-events: auto\"><button class=\"window-control-btn minimize-btn\" ng-click=\"minimizeWindow()\"><span class=\"glyphicon glyphicon-minus\"></span></button> <button class=\"window-control-btn maximize-btn\" ng-click=\"maximizeWindow()\"><span class=\"glyphicon\" ng-class=\"{'glyphicon-resize-full': !isMaximized, 'glyphicon-resize-small': isMaximized}\"></span></button> <button class=\"window-control-btn close-btn\" ng-click=\"closeWindow()\"><span class=\"glyphicon glyphicon-remove\"></span></button></div></div><uib-tabset><uib-tab active=\"tabStatus.file\" heading=\"{{ 'file' | lang: 'ui/tabs'; }}\" select=\"setCurTab('file')\"><file-operation minder=\"minder\" exit=\"goBackToIdea()\"></file-operation></uib-tab><uib-tab active=\"tabStatus.idea\" heading=\"{{ 'idea' | lang: 'ui/tabs'; }}\" ng-click=\"toggleTopTab('idea')\" select=\"setCurTab('idea')\"><undo-redo editor=\"editor\"></undo-redo><append-node minder=\"minder\"></append-node><arrange minder=\"minder\"></arrange><operation minder=\"minder\"></operation><hyper-link minder=\"minder\"></hyper-link><image-btn minder=\"minder\"></image-btn><note-btn minder=\"minder\"></note-btn><priority-editor minder=\"minder\"></priority-editor><progress-editor minder=\"minder\"></progress-editor><resource-editor minder=\"minder\"></resource-editor></uib-tab><uib-tab heading=\"{{ 'appearence' | lang: 'ui/tabs'; }}\" ng-click=\"toggleTopTab('appearance')\" select=\"setCurTab('appearance')\"><template-list minder=\"minder\" class=\"inline-directive\"></template-list><theme-list minder=\"minder\"></theme-list><layout minder=\"minder\" class=\"inline-directive\"></layout><style-operator minder=\"minder\" class=\"inline-directive\"></style-operator><font-operator minder=\"minder\" class=\"inline-directive\"></font-operator></uib-tab><uib-tab heading=\"{{ 'view' | lang: 'ui/tabs'; }}\" ng-click=\"toggleTopTab('view')\" select=\"setCurTab('view')\"><expand-level minder=\"minder\"></expand-level><select-all minder=\"minder\"></select-all><search-btn minder=\"minder\"></search-btn></uib-tab><uib-tab active=\"tabStatus.ai\" heading=\"{{ 'ai' | lang: 'ui/tabs'; }}\" ng-click=\"toggleTopTab('ai')\" select=\"setCurTab('ai')\"><ai-tab minder=\"minder\"></ai-tab></uib-tab></uib-tabset>"
  );


  $templateCache.put('ui/directive/undoRedo/undoRedo.html',
    "<div class=\"km-btn-group do-group\"><div class=\"km-btn-item undo\" ng-disabled=\"editor.history.hasUndo() == false\" ng-click=\"editor.history.hasUndo() == false || editor.history.undo();\" title=\"{{ 'undo' | lang:'ui' }}\"><i class=\"km-btn-icon\"></i></div><div class=\"km-btn-item redo\" ng-disabled=\"editor.history.hasRedo() == false\" ng-click=\"editor.history.hasRedo() == false || editor.history.redo()\" title=\"{{ 'redo' | lang:'ui' }}\"><i class=\"km-btn-icon\"></i></div></div>"
  );


  $templateCache.put('ui/dialog/aiExport/aiExport.tpl.html',
    "<div class=\"ai-export-dialog\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"cancel()\"><span>&times;</span></button><h4 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/aiexport' }}</h4></div><div class=\"modal-body\"><div ng-hide=\"showResult\"><p class=\"ai-export-hint\">{{ 'selectformat' | lang: 'ui/dialog/aiexport' }}</p><div class=\"ai-export-formats\"><div class=\"ai-export-format-item\" ng-repeat=\"fmt in formats\" ng-class=\"{'selected': selectedFormat === fmt.id}\" ng-click=\"selectFormat(fmt.id)\"><span class=\"glyphicon\" ng-class=\"fmt.icon\"></span> <span class=\"format-name\">{{fmt.name}}</span> <span class=\"glyphicon glyphicon-ok check-icon\" ng-show=\"selectedFormat === fmt.id\"></span></div></div><div class=\"ai-export-desc\"><div ng-show=\"selectedFormat === 'article'\">{{ 'articledesc' | lang: 'ui/dialog/aiexport' }}</div><div ng-show=\"selectedFormat === 'report'\">{{ 'reportdesc' | lang: 'ui/dialog/aiexport' }}</div><div ng-show=\"selectedFormat === 'outline'\">{{ 'outlinedesc' | lang: 'ui/dialog/aiexport' }}</div></div></div><div ng-show=\"showResult\"><div class=\"ai-export-result-header\"><button class=\"btn btn-sm btn-default\" ng-click=\"back()\"><span class=\"glyphicon glyphicon-arrow-left\"></span> {{ 'back' | lang: 'ui/dialog/aiexport' }}</button></div><div class=\"ai-export-result\"><textarea class=\"ai-export-textarea\" readonly>{{result}}</textarea></div></div><div class=\"ai-export-loading\" ng-show=\"loading\"><span class=\"glyphicon glyphicon-refresh spinning\"></span> <span>{{ 'generating' | lang: 'ui/dialog/aiexport' }}</span></div></div><div class=\"modal-footer\"><div ng-hide=\"showResult\"><button class=\"btn btn-primary\" ng-click=\"generate()\" ng-disabled=\"loading\"><span ng-hide=\"loading\">{{ 'generate' | lang: 'ui/dialog/aiexport' }}</span> <span ng-show=\"loading\">{{ 'generating' | lang: 'ui/dialog/aiexport' }}</span></button> <button class=\"btn btn-default\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/aiexport' }}</button></div><div ng-show=\"showResult\"><button class=\"btn btn-default\" ng-click=\"cancel()\">{{ 'close' | lang: 'ui/dialog/aiexport' }}</button> <button class=\"btn btn-default\" ng-click=\"copyToClipboard()\"><span class=\"glyphicon glyphicon-copy\"></span> {{ 'copy' | lang: 'ui/dialog/aiexport' }}</button> <button class=\"btn btn-primary\" ng-click=\"saveToFile()\"><span class=\"glyphicon glyphicon-save\"></span> {{ 'save' | lang: 'ui/dialog/aiexport' }}</button></div></div></div><style>.ai-export-dialog .ai-export-hint {\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "    margin-bottom: 15px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-formats {\r" +
    "\n" +
    "    display: flex;\r" +
    "\n" +
    "    gap: 15px;\r" +
    "\n" +
    "    margin-bottom: 20px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item {\r" +
    "\n" +
    "    flex: 1;\r" +
    "\n" +
    "    padding: 20px 15px;\r" +
    "\n" +
    "    border: 2px solid #ddd;\r" +
    "\n" +
    "    border-radius: 8px;\r" +
    "\n" +
    "    text-align: center;\r" +
    "\n" +
    "    cursor: pointer;\r" +
    "\n" +
    "    transition: all 0.2s;\r" +
    "\n" +
    "    position: relative;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item:hover {\r" +
    "\n" +
    "    border-color: #999;\r" +
    "\n" +
    "    background: #f9f9f9;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item.selected {\r" +
    "\n" +
    "    border-color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    background: rgba(252, 131, 131, 0.1);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item .glyphicon:first-child {\r" +
    "\n" +
    "    display: block;\r" +
    "\n" +
    "    font-size: 28px;\r" +
    "\n" +
    "    margin-bottom: 10px;\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item.selected .glyphicon:first-child {\r" +
    "\n" +
    "    color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item .format-name {\r" +
    "\n" +
    "    display: block;\r" +
    "\n" +
    "    font-size: 14px;\r" +
    "\n" +
    "    font-weight: 500;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-format-item .check-icon {\r" +
    "\n" +
    "    position: absolute;\r" +
    "\n" +
    "    top: 8px;\r" +
    "\n" +
    "    right: 8px;\r" +
    "\n" +
    "    color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-desc {\r" +
    "\n" +
    "    padding: 12px 15px;\r" +
    "\n" +
    "    background: #f5f5f5;\r" +
    "\n" +
    "    border-radius: 4px;\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-result {\r" +
    "\n" +
    "    margin-top: 10px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-textarea {\r" +
    "\n" +
    "    width: 100%;\r" +
    "\n" +
    "    height: 350px;\r" +
    "\n" +
    "    padding: 12px;\r" +
    "\n" +
    "    border: 1px solid #ddd;\r" +
    "\n" +
    "    border-radius: 4px;\r" +
    "\n" +
    "    font-family: 'Consolas', 'Monaco', monospace;\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "    line-height: 1.6;\r" +
    "\n" +
    "    resize: none;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-loading {\r" +
    "\n" +
    "    text-align: center;\r" +
    "\n" +
    "    padding: 40px;\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-loading .glyphicon {\r" +
    "\n" +
    "    margin-right: 8px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .spinning {\r" +
    "\n" +
    "    animation: spin 1s linear infinite;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    "@keyframes spin {\r" +
    "\n" +
    "    from { transform: rotate(0deg); }\r" +
    "\n" +
    "    to { transform: rotate(360deg); }\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-export-dialog .ai-export-result-header {\r" +
    "\n" +
    "    margin-bottom: 10px;\r" +
    "\n" +
    "}</style>"
  );


  $templateCache.put('ui/dialog/aiGenerate/aiGenerate.tpl.html',
    "<div class=\"modal-header ai-generate-header\"><h4 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/aigenerate' }}</h4></div><div class=\"modal-body ai-generate-body\"><div class=\"form-group\"><label>{{ 'inputlabel' | lang: 'ui/dialog/aigenerate' }}</label><textarea class=\"form-control ai-generate-input\" ng-model=\"topic\" rows=\"5\" placeholder=\"{{ 'placeholder' | lang: 'ui/dialog/aigenerate' }}\" ng-disabled=\"loading\">\r" +
    "\n" +
    "        </textarea></div><div class=\"ai-generate-hint\"><i class=\"glyphicon glyphicon-info-sign\"></i> {{ 'hint' | lang: 'ui/dialog/aigenerate' }}</div></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"generate()\" ng-disabled=\"loading || !topic.trim()\"><span ng-hide=\"loading\">{{ 'generate' | lang: 'ui/dialog/aigenerate' }}</span> <span ng-show=\"loading\">{{ 'generating' | lang: 'ui/dialog/aigenerate' }}</span></button> <button class=\"btn btn-default\" ng-click=\"cancel()\" ng-disabled=\"loading\">{{ 'cancel' | lang: 'ui/dialog/aigenerate' }}</button></div><style>.ai-generate-header {\r" +
    "\n" +
    "    background-color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    color: white;\r" +
    "\n" +
    "    border-radius: 5px 5px 0 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-generate-body {\r" +
    "\n" +
    "    padding: 20px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-generate-input {\r" +
    "\n" +
    "    resize: vertical;\r" +
    "\n" +
    "    min-height: 100px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-generate-hint {\r" +
    "\n" +
    "    margin-top: 10px;\r" +
    "\n" +
    "    color: #888;\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-generate-hint .glyphicon {\r" +
    "\n" +
    "    margin-right: 5px;\r" +
    "\n" +
    "}</style>"
  );


  $templateCache.put('ui/dialog/exportMarkdown/exportMarkdown.tpl.html',
    "<div class=\"modal-header export-md-modal-header\"><h3 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/exportMarkdown'}}</h3></div><div class=\"modal-body export-md-modal-body\"><div class=\"export-md-option\"><label class=\"export-md-label\">{{ 'headingLevels' | lang: 'ui/dialog/exportMarkdown'}}</label><select class=\"form-control export-md-select\" ng-model=\"options.headingLevels\"><option value=\"1\">1 {{ 'level' | lang: 'ui/dialog/exportMarkdown'}}</option><option value=\"2\">2 {{ 'levels' | lang: 'ui/dialog/exportMarkdown'}}</option><option value=\"3\">3 {{ 'levels' | lang: 'ui/dialog/exportMarkdown'}}</option><option value=\"4\">4 {{ 'levels' | lang: 'ui/dialog/exportMarkdown'}}</option><option value=\"5\">5 {{ 'levels' | lang: 'ui/dialog/exportMarkdown'}}</option><option value=\"6\">6 {{ 'levels' | lang: 'ui/dialog/exportMarkdown'}}</option></select><p class=\"export-md-hint\">{{ 'headingLevelsHint' | lang: 'ui/dialog/exportMarkdown'}}</p></div><div class=\"export-md-option\"><label class=\"export-md-label\">{{ 'rootNodeStyle' | lang: 'ui/dialog/exportMarkdown'}}</label><div class=\"radio\"><label><input type=\"radio\" ng-model=\"options.rootAsTitle\" ng-value=\"true\"> {{ 'rootAsDocTitle' | lang: 'ui/dialog/exportMarkdown'}}</label></div><div class=\"radio\"><label><input type=\"radio\" ng-model=\"options.rootAsTitle\" ng-value=\"false\"> {{ 'rootAsHeading' | lang: 'ui/dialog/exportMarkdown'}}</label></div></div><div class=\"export-md-option\"><label class=\"export-md-label\">{{ 'includeOptions' | lang: 'ui/dialog/exportMarkdown'}}</label><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"options.includeNote\"> {{ 'includeNote' | lang: 'ui/dialog/exportMarkdown'}}</label></div><div class=\"checkbox\"><label><input type=\"checkbox\" ng-model=\"options.includeLink\"> {{ 'includeLink' | lang: 'ui/dialog/exportMarkdown'}}</label></div></div></div><div class=\"modal-footer\"><button class=\"btn btn-default\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/exportMarkdown'}}</button> <button class=\"btn btn-primary\" ng-click=\"doExport()\">{{ 'export' | lang: 'ui/dialog/exportMarkdown'}}</button></div><style>.export-md-modal-header {\r" +
    "\n" +
    "    background-color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    color: white;\r" +
    "\n" +
    "    border-radius: 5px 5px 0 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-modal-header .modal-title {\r" +
    "\n" +
    "    font-weight: normal;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-modal-body {\r" +
    "\n" +
    "    padding: 20px 30px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-option {\r" +
    "\n" +
    "    margin-bottom: 20px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-label {\r" +
    "\n" +
    "    display: block;\r" +
    "\n" +
    "    font-weight: bold;\r" +
    "\n" +
    "    margin-bottom: 8px;\r" +
    "\n" +
    "    color: #333;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-select {\r" +
    "\n" +
    "    width: 150px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-hint {\r" +
    "\n" +
    "    font-size: 12px;\r" +
    "\n" +
    "    color: #888;\r" +
    "\n" +
    "    margin-top: 5px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".export-md-option .radio,\r" +
    "\n" +
    ".export-md-option .checkbox {\r" +
    "\n" +
    "    margin-top: 5px;\r" +
    "\n" +
    "    margin-bottom: 5px;\r" +
    "\n" +
    "}</style>"
  );


  $templateCache.put('ui/dialog/hyperlink/hyperlink.tpl.html',
    "<div class=\"modal-header\"><h3 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/hyperlink'}}</h3></div><div class=\"modal-body\"><form><div class=\"form-group\" id=\"link-url-wrap\" ng-class=\"{true: 'has-success', false: 'has-error'}[urlPassed]\"><label for=\"link-url\">{{ 'linkurl' | lang: 'ui/dialog/hyperlink'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"url\" ng-blur=\"urlPassed = R_URL.test(url)\" ng-focus=\"this.value = url\" ng-keydown=\"shortCut($event)\" id=\"link-url\" placeholder=\"{{ 'placeholder' | lang: 'ui/dialog/hyperlink'}}\"></div><div class=\"form-group\" ng-class=\"{'has-success' : titlePassed}\"><label for=\"link-title\">{{ 'linkhint' | lang: 'ui/dialog/hyperlink'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"title\" ng-blur=\"titlePassed = true\" id=\"link-title\" placeholder=\"{{ 'placeholder2' | lang: 'ui/dialog/hyperlink'}}\"></div></form></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"ok()\">{{ 'ok' | lang: 'ui/dialog/hyperlink'}}</button> <button class=\"btn btn-warning\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/hyperlink'}}</button></div>"
  );


  $templateCache.put('ui/dialog/imExportNode/imExportNode.tpl.html',
    "<div class=\"modal-header\"><h3 class=\"modal-title\">{{ title }}</h3></div><div class=\"modal-body\"><textarea type=\"text\" class=\"form-control single-input\" rows=\"8\" ng-keydown=\"shortCut($event);\" ng-model=\"value\" ng-readonly=\"type === 'export'\">\n" +
    "    </textarea></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"ok()\" ng-disabled=\"type === 'import' && value == ''\">{{ 'ok' | lang: 'ui/dialog/exportnode'}}</button> <button class=\"btn btn-warning\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/exportnode'}}</button></div>"
  );


  $templateCache.put('ui/dialog/image/image.tpl.html',
    "<div class=\"modal-header\"><h3 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/image'}}</h3></div><div class=\"modal-body\"><tabset><tab heading=\"{{ 'imagesearch' | lang: 'ui/dialog/image'}}\"><form class=\"form-inline\"><div class=\"form-group\"><label for=\"search-keyword\">{{ 'keyword' | lang: 'ui/dialog/image'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"data.searchKeyword2\" id=\"search-keyword\" placeholder=\"{{ 'placeholder' | lang: 'ui/dialog/image'}}\"></div><button class=\"btn btn-primary\" ng-click=\"searchImage()\">{{ 'baidu' | lang: 'ui/dialog/image'}}</button></form><div class=\"search-result\" id=\"search-result\"><ul><li ng-repeat=\"image in list\" id=\"{{ 'img-item' + $index }}\" ng-class=\"{'selected' : isSelected}\" ng-click=\"selectImage($event)\"><img id=\"{{ 'img-' + $index }}\" ng-src=\"{{ image.src || '' }}\" alt=\"{{ image.title }}\" onerror=\"this.parentNode.removeChild(this)\"> <span>{{ image.title }}</span></li></ul></div></tab><tab heading=\"{{ 'linkimage' | lang: 'ui/dialog/image'}}\"><form><div class=\"form-group\" ng-class=\"{true: 'has-success', false: 'has-error'}[urlPassed]\"><label for=\"image-url\">{{ 'linkurl' | lang: 'ui/dialog/image'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"data.url\" ng-blur=\"urlPassed = data.R_URL.test(data.url)\" ng-focus=\"this.value = data.url\" ng-keydown=\"shortCut($event)\" id=\"image-url\" placeholder=\"{{ 'placeholder2' | lang: 'ui/dialog/image'}}\"></div><div class=\"form-group\" ng-class=\"{'has-success' : titlePassed}\"><label for=\"image-title\">{{ 'imagehint' | lang: 'ui/dialog/image'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"data.title\" ng-blur=\"titlePassed = true\" placeholder=\"{{ 'placeholder3' | lang: 'ui/dialog/image'}}\"></div><div class=\"form-group\"><label for=\"image-preview\">{{ 'preview' | lang: 'ui/dialog/image'}}</label><img class=\"image-preview\" ng-src=\"{{ data.url }}\" alt=\"{{ data.title }}\"></div></form></tab><tab heading=\"{{ 'uploadimage' | lang: 'ui/dialog/image'}}\" active=\"true\"><form><div class=\"form-group\"><input type=\"file\" name=\"upload-image\" id=\"upload-image\" class=\"upload-image\" accept=\".jpg,.JPG,jpeg,JPEG,.png,.PNG,.gif,.GIF\"><label for=\"upload-image\" class=\"btn btn-primary\"><span>{{ 'selectfile' | lang: 'ui/dialog/image'}}</span></label></div><div class=\"form-group\" ng-class=\"{'has-success' : titlePassed}\"><label for=\"image-title\">{{ 'imagehint' | lang: 'ui/dialog/image'}}</label><input type=\"text\" class=\"form-control\" ng-model=\"data.title\" ng-blur=\"titlePassed = true\" placeholder=\"{{ 'placeholder3' | lang: 'ui/dialog/image'}}\"></div><div class=\"form-group\"><label for=\"image-preview\">{{ 'preview' | lang: 'ui/dialog/image'}}</label><img class=\"image-preview\" ng-src=\"{{ data.url }}\" title=\"{{ data.title }}\" alt=\"{{ data.title }}\"></div></form></tab></tabset></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"ok()\">{{ 'ok' | lang: 'ui/dialog/image'}}</button> <button class=\"btn btn-warning\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/image'}}</button></div>"
  );


  $templateCache.put('ui/dialog/settings/settings.tpl.html',
    "<div class=\"modal-header settings-modal-header\"><h3 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/settings'}}</h3></div><div class=\"modal-body settings-modal-body\"><ul class=\"nav nav-tabs settings-tabs\"><li ng-class=\"{'active': activeTab === 'general'}\"><a href ng-click=\"setActiveTab('general')\">{{ 'general' | lang: 'ui/dialog/settings'}}</a></li><li ng-class=\"{'active': activeTab === 'ai'}\"><a href ng-click=\"setActiveTab('ai')\">{{ 'ai' | lang: 'ui/dialog/settings'}}</a></li></ul><div class=\"tab-content settings-tab-content\"><div class=\"tab-pane\" ng-class=\"{'active': activeTab === 'general'}\"><div class=\"settings-section\"><h4 class=\"settings-section-title\">{{ 'language' | lang: 'ui'}}</h4><div class=\"settings-section-content\"><div class=\"dropdown\" uib-dropdown style=\"display: inline-block\"><button class=\"btn btn-default dropdown-toggle\" uib-dropdown-toggle>{{ getLangLabel(settings.lang) }} <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"><li><a href ng-click=\"selectLang('system')\">{{ 'systemlanguage' | lang: 'ui' }}</a></li><li class=\"divider\"></li><li ng-repeat=\"lang in supportedLangs\"><a href ng-click=\"selectLang(lang.key)\">{{lang.label}}</a></li></ul></div></div></div><div class=\"settings-section\"><h4 class=\"settings-section-title\">{{ 'themecolor' | lang: 'ui/dialog/settings'}}</h4><div class=\"settings-section-content\"><div class=\"theme-color-grid\"><div class=\"theme-color-item\" ng-repeat=\"colorObj in themeColors\" ng-click=\"selectThemeColor(colorObj)\" ng-class=\"{'selected': isColorSelected(colorObj)}\" ng-style=\"{'background-color': colorObj.color}\" title=\"{{colorObj.name}}\"><span class=\"glyphicon glyphicon-ok\" ng-show=\"isColorSelected(colorObj)\"></span></div></div></div></div><div class=\"settings-section\"><h4 class=\"settings-section-title\">{{ 'autobackup' | lang: 'ui/dialog/settings'}}</h4><div class=\"settings-section-content\"><div class=\"settings-row\"><label class=\"settings-checkbox\"><input type=\"checkbox\" ng-model=\"settings.autoBackup\"> <span>{{ 'enableautobackup' | lang: 'ui/dialog/settings'}}</span></label></div><div class=\"settings-row\" ng-show=\"settings.autoBackup\"><label>{{ 'backupinterval' | lang: 'ui/dialog/settings'}}</label><select ng-model=\"settings.backupInterval\" class=\"form-control settings-select\"><option value=\"1\">1 {{ 'minute' | lang: 'ui/dialog/settings'}}</option><option value=\"3\">3 {{ 'minutes' | lang: 'ui/dialog/settings'}}</option><option value=\"5\">5 {{ 'minutes' | lang: 'ui/dialog/settings'}}</option><option value=\"10\">10 {{ 'minutes' | lang: 'ui/dialog/settings'}}</option><option value=\"15\">15 {{ 'minutes' | lang: 'ui/dialog/settings'}}</option><option value=\"30\">30 {{ 'minutes' | lang: 'ui/dialog/settings'}}</option></select></div><div class=\"settings-row\" ng-show=\"settings.autoBackup\"><label class=\"settings-checkbox\"><input type=\"checkbox\" ng-model=\"settings.deleteBackupOnSave\"> <span>{{ 'deletebackuponsave' | lang: 'ui/dialog/settings'}}</span></label></div><div class=\"settings-row backup-info\" ng-show=\"settings.autoBackup\"><span>{{ 'backupsize' | lang: 'ui/dialog/settings'}}</span> <span class=\"backup-size-value\" ng-click=\"openBackupDir()\" title=\"{{ 'clicktoopenbackupdir' | lang: 'ui/dialog/settings'}}\">{{ backupSizeDisplay }}</span></div></div></div></div><div class=\"tab-pane\" ng-class=\"{'active': activeTab === 'ai'}\"><div class=\"settings-section\"><h4 class=\"settings-section-title\">{{ 'aiprovider' | lang: 'ui/dialog/settings'}}</h4><div class=\"settings-section-content\"><div class=\"dropdown\" uib-dropdown style=\"display: inline-block\"><button class=\"btn btn-default dropdown-toggle\" uib-dropdown-toggle>{{ getProviderLabel(aiSettings.provider) }} <span class=\"caret\"></span></button><ul class=\"dropdown-menu\"><li ng-repeat=\"p in aiProviders\"><a href ng-click=\"selectProvider(p.key)\">{{ getProviderLabel(p.key) }}</a></li></ul></div></div></div><div class=\"settings-section\"><h4 class=\"settings-section-title\">API Key</h4><div class=\"settings-section-content\"><div class=\"settings-row\"><input type=\"password\" class=\"form-control settings-input\" ng-model=\"aiSettings.apiKey\" placeholder=\"{{ aiSettings.hasApiKey ? '••••••••••••••••' : 'sk-...' }}\"> <button class=\"btn btn-sm btn-default\" ng-click=\"testAiConfig()\" ng-disabled=\"aiTesting\"><span ng-hide=\"aiTesting\">{{ 'testapikey' | lang: 'ui/dialog/settings'}}</span> <span ng-show=\"aiTesting\">{{ 'testing' | lang: 'ui/dialog/settings'}}</span></button></div><div class=\"settings-row ai-test-result\" ng-show=\"aiTestResult\"><span ng-class=\"{'text-success': aiTestSuccess, 'text-danger': !aiTestSuccess}\">{{ aiTestResult }}</span></div><div class=\"settings-row ai-config-status\"><span ng-if=\"aiSettings.testPassed\" class=\"text-success\"><i class=\"glyphicon glyphicon-ok-circle\"></i> {{ 'aitestpassed' | lang: 'ui/dialog/settings'}}</span> <span ng-if=\"!aiSettings.testPassed && aiSettings.hasApiKey\" class=\"text-warning\"><i class=\"glyphicon glyphicon-exclamation-sign\"></i> {{ 'airequiretest' | lang: 'ui/dialog/settings'}}</span> <span ng-if=\"!aiSettings.hasApiKey\" class=\"text-muted\"><i class=\"glyphicon glyphicon-info-sign\"></i> {{ 'ainotconfigured' | lang: 'ui/dialog/settings'}}</span></div></div></div><div class=\"settings-section\" ng-show=\"aiSettings.provider === 'custom'\"><h4 class=\"settings-section-title\">{{ 'customsettings' | lang: 'ui/dialog/settings'}}</h4><div class=\"settings-section-content\"><div class=\"settings-row\"><label>{{ 'apiurl' | lang: 'ui/dialog/settings'}}</label><input type=\"text\" class=\"form-control settings-input-full\" ng-model=\"aiSettings.apiUrl\" placeholder=\"https://api.example.com/v1/chat/completions\" title=\"{{ 'apiurlhint' | lang: 'ui/dialog/settings'}}\"></div><div class=\"settings-row\"><label>{{ 'modelname' | lang: 'ui/dialog/settings'}}</label><input type=\"text\" class=\"form-control settings-input-full\" ng-model=\"aiSettings.model\" placeholder=\"gpt-4o-mini\"></div></div></div><div class=\"settings-section ai-features-info\"><h4 class=\"settings-section-title\">{{ 'aifeatures' | lang: 'ui/dialog/settings'}}</h4><div class=\"settings-section-content\"><ul class=\"ai-features-list\"><li><i class=\"glyphicon glyphicon-plus\"></i> {{ 'aifeature_expand' | lang: 'ui/dialog/settings'}}</li><li><i class=\"glyphicon glyphicon-edit\"></i> {{ 'aifeature_rewrite' | lang: 'ui/dialog/settings'}}</li><li><i class=\"glyphicon glyphicon-list-alt\"></i> {{ 'aifeature_summarize' | lang: 'ui/dialog/settings'}}</li><li><i class=\"glyphicon glyphicon-tree-conifer\"></i> {{ 'aifeature_generate' | lang: 'ui/dialog/settings'}}</li><li><i class=\"glyphicon glyphicon-comment\"></i> {{ 'aifeature_chat' | lang: 'ui/dialog/settings'}}</li></ul></div></div></div></div></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"save()\">{{ 'ok' | lang: 'ui/dialog/settings'}}</button> <button class=\"btn btn-default\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/settings'}}</button></div><style>.settings-modal-header {\r" +
    "\n" +
    "    background-color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    color: white;\r" +
    "\n" +
    "    border-radius: 5px 5px 0 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-modal-header .modal-title {\r" +
    "\n" +
    "    font-weight: normal;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-modal-body {\r" +
    "\n" +
    "    padding: 15px 20px;\r" +
    "\n" +
    "    min-height: 400px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-tabs {\r" +
    "\n" +
    "    margin-bottom: 15px;\r" +
    "\n" +
    "    border-bottom: 2px solid #eee;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-tabs > li > a {\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "    border: none;\r" +
    "\n" +
    "    padding: 8px 20px;\r" +
    "\n" +
    "    margin-right: 5px;\r" +
    "\n" +
    "    border-radius: 4px 4px 0 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-tabs > li > a:hover {\r" +
    "\n" +
    "    background-color: #f5f5f5;\r" +
    "\n" +
    "    border: none;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-tabs > li.active > a,\r" +
    "\n" +
    ".settings-tabs > li.active > a:hover,\r" +
    "\n" +
    ".settings-tabs > li.active > a:focus {\r" +
    "\n" +
    "    color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    background-color: transparent;\r" +
    "\n" +
    "    border: none;\r" +
    "\n" +
    "    border-bottom: 2px solid var(--theme-color, #fc8383);\r" +
    "\n" +
    "    margin-bottom: -2px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-tab-content {\r" +
    "\n" +
    "    padding: 10px 5px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".tab-pane {\r" +
    "\n" +
    "    display: none;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".tab-pane.active {\r" +
    "\n" +
    "    display: block;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-section {\r" +
    "\n" +
    "    margin-bottom: 20px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-section-title {\r" +
    "\n" +
    "    font-size: 14px;\r" +
    "\n" +
    "    font-weight: 600;\r" +
    "\n" +
    "    color: #555;\r" +
    "\n" +
    "    margin-bottom: 10px;\r" +
    "\n" +
    "    padding-bottom: 6px;\r" +
    "\n" +
    "    border-bottom: 1px solid #eee;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-section-content {\r" +
    "\n" +
    "    padding-left: 5px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-row {\r" +
    "\n" +
    "    margin-bottom: 10px;\r" +
    "\n" +
    "    display: flex;\r" +
    "\n" +
    "    align-items: center;\r" +
    "\n" +
    "    gap: 10px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-checkbox {\r" +
    "\n" +
    "    display: flex;\r" +
    "\n" +
    "    align-items: center;\r" +
    "\n" +
    "    cursor: pointer;\r" +
    "\n" +
    "    margin: 0;\r" +
    "\n" +
    "    font-weight: normal;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-checkbox input[type=\"checkbox\"] {\r" +
    "\n" +
    "    margin-right: 8px;\r" +
    "\n" +
    "    width: 16px;\r" +
    "\n" +
    "    height: 16px;\r" +
    "\n" +
    "    cursor: pointer;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-select {\r" +
    "\n" +
    "    width: auto;\r" +
    "\n" +
    "    min-width: 120px;\r" +
    "\n" +
    "    display: inline-block;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-input {\r" +
    "\n" +
    "    flex: 1;\r" +
    "\n" +
    "    max-width: 300px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-input-full {\r" +
    "\n" +
    "    flex: 1;\r" +
    "\n" +
    "    width: 100%;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".settings-hint {\r" +
    "\n" +
    "    display: block;\r" +
    "\n" +
    "    width: 100%;\r" +
    "\n" +
    "    margin-top: 4px;\r" +
    "\n" +
    "    color: #888;\r" +
    "\n" +
    "    font-size: 12px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".backup-info {\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".backup-size-value {\r" +
    "\n" +
    "    color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    cursor: pointer;\r" +
    "\n" +
    "    text-decoration: underline;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".backup-size-value:hover {\r" +
    "\n" +
    "    color: var(--theme-color-hover, #e77070);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".theme-color-grid {\r" +
    "\n" +
    "    display: grid;\r" +
    "\n" +
    "    grid-template-columns: repeat(8, 36px);\r" +
    "\n" +
    "    gap: 8px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".theme-color-item {\r" +
    "\n" +
    "    width: 36px;\r" +
    "\n" +
    "    height: 36px;\r" +
    "\n" +
    "    border-radius: 4px;\r" +
    "\n" +
    "    cursor: pointer;\r" +
    "\n" +
    "    display: flex;\r" +
    "\n" +
    "    align-items: center;\r" +
    "\n" +
    "    justify-content: center;\r" +
    "\n" +
    "    transition: transform 0.15s, box-shadow 0.15s;\r" +
    "\n" +
    "    border: 2px solid transparent;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".theme-color-item:hover {\r" +
    "\n" +
    "    transform: scale(1.1);\r" +
    "\n" +
    "    box-shadow: 0 2px 8px rgba(0,0,0,0.2);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".theme-color-item.selected {\r" +
    "\n" +
    "    border-color: #333;\r" +
    "\n" +
    "    box-shadow: 0 0 0 2px white, 0 0 0 4px #333;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".theme-color-item .glyphicon {\r" +
    "\n" +
    "    color: white;\r" +
    "\n" +
    "    font-size: 14px;\r" +
    "\n" +
    "    text-shadow: 0 1px 2px rgba(0,0,0,0.3);\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    "/* AI 设置样式 */\r" +
    "\n" +
    ".ai-test-result {\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-features-info {\r" +
    "\n" +
    "    background: #f9f9f9;\r" +
    "\n" +
    "    padding: 10px;\r" +
    "\n" +
    "    border-radius: 4px;\r" +
    "\n" +
    "    margin-top: 15px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-features-list {\r" +
    "\n" +
    "    list-style: none;\r" +
    "\n" +
    "    padding: 0;\r" +
    "\n" +
    "    margin: 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-features-list li {\r" +
    "\n" +
    "    padding: 5px 0;\r" +
    "\n" +
    "    color: #666;\r" +
    "\n" +
    "    font-size: 13px;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".ai-features-list li .glyphicon {\r" +
    "\n" +
    "    margin-right: 8px;\r" +
    "\n" +
    "    color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    width: 16px;\r" +
    "\n" +
    "}</style>"
  );


  $templateCache.put('ui/dialog/unsaved/unsaved.tpl.html',
    "<div class=\"modal-header unsaved-modal-header\"><h3 class=\"modal-title\">{{ 'title' | lang: 'ui/dialog/unsaved'}}</h3></div><div class=\"modal-body unsaved-modal-body\"><p class=\"unsaved-message\">{{ 'message' | lang: 'ui/dialog/unsaved'}}</p></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"save()\">{{ 'save' | lang: 'ui/dialog/unsaved'}}</button> <button class=\"btn btn-default\" ng-click=\"dontSave()\">{{ 'dontsave' | lang: 'ui/dialog/unsaved'}}</button> <button class=\"btn btn-default\" ng-click=\"cancel()\">{{ 'cancel' | lang: 'ui/dialog/unsaved'}}</button></div><style>.unsaved-modal-header {\r" +
    "\n" +
    "    background-color: var(--theme-color, #fc8383);\r" +
    "\n" +
    "    color: white;\r" +
    "\n" +
    "    border-radius: 5px 5px 0 0;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".unsaved-modal-header .modal-title {\r" +
    "\n" +
    "    font-weight: normal;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".unsaved-modal-body {\r" +
    "\n" +
    "    padding: 30px 40px;\r" +
    "\n" +
    "    text-align: center;\r" +
    "\n" +
    "}\r" +
    "\n" +
    "\r" +
    "\n" +
    ".unsaved-message {\r" +
    "\n" +
    "    font-size: 16px;\r" +
    "\n" +
    "    color: #555;\r" +
    "\n" +
    "    margin: 0;\r" +
    "\n" +
    "}</style>"
  );

}]);
