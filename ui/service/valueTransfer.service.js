angular.module('kityminderEditor')
    .service('valueTransfer', function() {
        return {
            noteEditorOpen: false,
            aiChatPanelOpen: false,
            // AI 改写遮罩层状态
            aiRewriting: false,
            aiRewriteCancel: false,  // 取消标志
            aiRewriteCallback: null  // 取消回调
        };
    });