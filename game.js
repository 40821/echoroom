// 游戏全局状态管理
const GameState = {
    // 从本地存储读取状态，默认初始值
    load() {
        const saved = localStorage.getItem('echoBoardState');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
    },

    save() {
        const state = {
            visitedGuestbook: this.visitedGuestbook,
            unlockedAlbum: this.unlockedAlbum,
            unlockedChatroom: this.unlockedChatroom,
            sentPrivateMsg: this.sentPrivateMsg,
            knowsDeleteRequest: this.knowsDeleteRequest,
            deletedLastPost: this.deletedLastPost,
            badEnding: this.badEnding,
            trueEnding: this.trueEnding,
            visitorCount: this.visitorCount,
            serverTime: this.serverTime,
            albumRefreshed: this.albumRefreshed,
            postRefreshed: this.postRefreshed
        };
        localStorage.setItem('echoBoardState', JSON.stringify(state));
    },

    // 初始状态
    visitedGuestbook: false,
    unlockedAlbum: false,
    unlockedChatroom: false,
    sentPrivateMsg: false,
    knowsDeleteRequest: false,
    deletedLastPost: false,
    badEnding: false,
    trueEnding: false,
    visitorCount: 404,
    serverTime: "1999-12-31 23:59:59",
    albumRefreshed: false,
    postRefreshed: false
};

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    GameState.load();
    updateFooterInfo();
    updateNavLockState();
    initPageEvents();
});

// 更新底部状态栏信息
function updateFooterInfo() {
    const timeEl = document.getElementById('server-time');
    const countEl = document.getElementById('visitor-count');
    if (timeEl) timeEl.textContent = GameState.serverTime;
    if (countEl) countEl.textContent = GameState.visitorCount;
}

// 更新导航栏锁定状态
function updateNavLockState() {
    const albumNav = document.getElementById('nav-album');
    const chatNav = document.getElementById('nav-chatroom');

    if (albumNav) {
        if (!GameState.unlockedAlbum) {
            albumNav.classList.add('locked');
            albumNav.href = '#';
            albumNav.onclick = (e) => {
                e.preventDefault();
                showModal('\u63d0\u793a', '\u8be5\u677f\u5757\u6682\u672a\u5f00\u653e\uff0c\u8bf7\u5148\u6d4f\u89c8\u7559\u8a00\u7c3f\u3002');
            };
        } else {
            albumNav.classList.remove('locked');
            albumNav.href = 'album.html';
            albumNav.onclick = null;
        }
    }

    if (chatNav) {
        if (!GameState.unlockedChatroom) {
            chatNav.classList.add('locked');
            chatNav.href = '#';
            chatNav.onclick = (e) => {
                e.preventDefault();
                showModal('\u63d0\u793a', '\u804a\u5929\u5ba4\u9700\u8981\u5bc6\u7801\u8bbf\u95ee\u3002');
            };
        } else {
            chatNav.classList.remove('locked');
            chatNav.href = 'chatroom.html';
            chatNav.onclick = null;
        }
    }
}

// 通用弹窗
function showModal(title, text, buttons = null) {
    let modal = document.getElementById('common-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'common-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <h3 id="modal-title"></h3>
                <p id="modal-text"></p>
                <div class="modal-buttons" id="modal-buttons">
                    <button class="btn" onclick="closeModal()">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;
    modal.style.display = 'flex';

    // 自定义按钮
    const btnContainer = document.getElementById('modal-buttons');
    if (buttons) {
        btnContainer.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'btn';
            button.textContent = btn.text;
            button.onclick = () => {
                closeModal();
                if (btn.action) btn.action();
            };
            btnContainer.appendChild(button);
        });
    } else {
        btnContainer.innerHTML = '<button class="btn" onclick="closeModal()">确定</button>';
    }
}

function closeModal() {
    document.getElementById('common-modal').style.display = 'none';
}

// 离开按钮处理
function handleLeave() {
    showModal('确认离开', '确定要离开吗？她还没有说完。', [
        {
            text: '确认离开',
            action: () => {
                showEnding('静默离开', 
                    '浏览器窗口缓缓关闭。\n你没有保存任何留言，也没有留下任何痕迹。\n\n林晚秋会继续停留在1999年的最后一秒，\n等待下一个打开网页的人。\n\n也许，从来没有人真的停下来听完过。'
                );
            }
        },
        { text: '再等等' }
    ]);
}

// 显示结局
function showEnding(title, text) {
    document.querySelector('.content').innerHTML = `
        <div class="ending-screen">
            <h2>${title}</h2>
            <div class="ending-text">${text}</div>
            <button class="btn" onclick="resetGame()">重新开始</button>
        </div>
    `;
}

// 重置游戏
function resetGame() {
    clearGameCache();
    location.href = 'index.html';
}

function clearGameCache() {
    localStorage.removeItem('echoBoardState');
    localStorage.removeItem('albumUnlocked');
    sessionStorage.removeItem('echoBoardStoryNavigation');
}

// 检查坏结局关键词
function checkBadEnding(input) {
    if (input.includes('救救我') && !GameState.badEnding) {
        GameState.badEnding = true;
        GameState.save();
        triggerBadEnding();
        return true;
    }
    return false;
}

// 触发坏结局
function triggerBadEnding() {
    document.body.style.backgroundColor = '#000';
    document.querySelector('.container').style.display = 'none';

    const badScreen = document.createElement('div');
    badScreen.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#A85252;padding:80px 20px;text-align:center;font-family:SimSun, serif;line-height:2;';
    badScreen.innerHTML = `
        <div style="font-size:18px;margin-bottom:30px;">永续循环</div>
        <div style="font-size:14px;white-space:pre-line;">
救救我
救救我
救救我
救救我
救救我

你终于明白了。
那些留言不全是她写的。
更多的，是和你一样读到最后的人。

你的账号名慢慢变成了 "访客_404"。
聊天室列表里，多出了一个灰色的 "访客_405"。

你想对他说点什么。
输入框里自动浮现出一行字：
"我是读到最后一条留言的人。"

循环，永远不会停止。
        </div>
        <button class="btn" style="margin-top:50px;" onclick="resetGame()">重新开始</button>
    `;
    document.body.appendChild(badScreen);
}

// 页面特有事件初始化（各页面自行覆盖）
function initPageEvents() {
    // 离开按钮
    const leaveBtn = document.getElementById('nav-leave');
    if (leaveBtn) {
        leaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLeave();
        });
    }
}
