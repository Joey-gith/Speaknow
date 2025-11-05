// 短语数据管理
let phrases = [];
let filteredPhrases = [];
let searchQuery = '';

// 从本地存储加载短语
function loadPhrases() {
    const savedPhrases = localStorage.getItem('phrases');
    if (savedPhrases) {
        phrases = JSON.parse(savedPhrases);
        // 兼容旧数据：为没有场景字段的短语添加默认值
        let needsUpdate = false;
        phrases.forEach(phrase => {
            if (!phrase.scene) {
                phrase.scene = '未设置';
                needsUpdate = true;
            }
            // 删除旧的audioUrl字段（如果存在）
            if (phrase.audioUrl !== undefined) {
                delete phrase.audioUrl;
                needsUpdate = true;
            }
        });
        // 如果有更新，保存回去（不触发渲染，因为后面会调用renderPhrases）
        if (needsUpdate) {
            localStorage.setItem('phrases', JSON.stringify(phrases));
        }
    }
    renderPhrases();
}

// 保存短语到本地存储
function savePhrases() {
    localStorage.setItem('phrases', JSON.stringify(phrases));
    renderPhrases();
}

// 过滤短语
function filterPhrases() {
    if (!searchQuery.trim()) {
        filteredPhrases = phrases;
    } else {
        const query = searchQuery.trim().toLowerCase();
        filteredPhrases = phrases.filter(phrase => {
            const scene = (phrase.scene || '未设置').toLowerCase();
            return scene.includes(query);
        });
    }
    renderFilteredPhrases();
}

// 渲染过滤后的短语卡片
function renderFilteredPhrases() {
    const container = document.getElementById('phrases-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (phrases.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有添加任何短语，快去添加吧！</div>';
        return;
    }
    
    if (filteredPhrases.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到匹配场景的短语</div>';
        return;
    }
    
    filteredPhrases.forEach((phrase, index) => {
        const card = createPhraseCard(phrase, index);
        container.appendChild(card);
    });
}

// 渲染短语卡片（兼容旧代码）
function renderPhrases() {
    // 初始化时，如果没有搜索查询，显示所有短语
    if (!searchQuery) {
        filteredPhrases = phrases;
        renderFilteredPhrases();
    } else {
        filterPhrases();
    }
}

// 创建短语卡片
function createPhraseCard(phrase, index) {
    const card = document.createElement('div');
    card.className = 'phrase-card';
    card.setAttribute('data-id', phrase.id);
    
    card.innerHTML = `
        <div class="phrase-content">
            <div class="phrase-item">
                <span class="phrase-label">英语短语</span>
                <p class="english-text">${escapeHtml(phrase.english)}</p>
                <input type="text" class="edit-input english-input" value="${escapeHtml(phrase.english)}" style="display: none;">
            </div>
            <div class="phrase-item">
                <span class="phrase-label">中文翻译</span>
                <p class="chinese-text">${escapeHtml(phrase.chinese)}</p>
                <input type="text" class="edit-input chinese-input" value="${escapeHtml(phrase.chinese)}" style="display: none;">
            </div>
            <div class="phrase-item">
                <span class="phrase-label">场景</span>
                <p class="scene-text">${escapeHtml(phrase.scene || '未设置')}</p>
                <input type="text" class="edit-input scene-input" value="${escapeHtml(phrase.scene || '未设置')}" style="display: none;">
            </div>
        </div>
        <div class="audio-controls">
            <button class="btn-audio btn-edit-phrase" title="编辑卡片" data-id="${phrase.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>编辑卡片</span>
            </button>
            <button class="btn-audio btn-save-phrase" title="保存" data-id="${phrase.id}" style="display: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>保存</span>
            </button>
            <button class="btn-audio btn-cancel-edit" title="取消" data-id="${phrase.id}" style="display: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span>取消</span>
            </button>
            <button class="btn-audio btn-delete-phrase" title="删除卡片" data-id="${phrase.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>删除卡片</span>
            </button>
        </div>
    `;
    
    return card;
}

// HTML 转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示庆祝图片
function showCelebration() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 3秒后自动关闭
        setTimeout(() => {
            hideCelebration();
        }, 3000);
    }
}

// 隐藏庆祝图片
function hideCelebration() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 添加新短语
function addPhrase(english, chinese, scene) {
    const newPhrase = {
        id: Date.now(),
        english: english.trim(),
        chinese: chinese.trim(),
        scene: scene.trim()
    };
    
    phrases.push(newPhrase);
    savePhrases();
    renderPhrases();
    
    // 切换到短语卡片界面
    switchToCardsView();
    
    // 显示庆祝图片
    showCelebration();
}

// 编辑短语
function editPhrase(id) {
    const card = document.querySelector(`.phrase-card[data-id="${id}"]`);
    if (!card) return;
    
    // 显示输入框，隐藏文本
    const englishText = card.querySelector('.english-text');
    const chineseText = card.querySelector('.chinese-text');
    const sceneText = card.querySelector('.scene-text');
    const englishInput = card.querySelector('.english-input');
    const chineseInput = card.querySelector('.chinese-input');
    const sceneInput = card.querySelector('.scene-input');
    
    englishText.style.display = 'none';
    chineseText.style.display = 'none';
    sceneText.style.display = 'none';
    englishInput.style.display = 'block';
    chineseInput.style.display = 'block';
    sceneInput.style.display = 'block';
    
    // 显示保存和取消按钮，隐藏编辑按钮
    const editBtn = card.querySelector('.btn-edit-phrase');
    const saveBtn = card.querySelector('.btn-save-phrase');
    const cancelBtn = card.querySelector('.btn-cancel-edit');
    const deleteBtn = card.querySelector('.btn-delete-phrase');
    
    editBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';
    
    // 聚焦到第一个输入框
    englishInput.focus();
    englishInput.select();
    
    // 添加回车键保存功能
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            savePhraseEdit(id);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit(id);
        }
    };
    
    // 为输入框添加键盘事件
    englishInput.addEventListener('keydown', handleKeyDown);
    chineseInput.addEventListener('keydown', handleKeyDown);
    sceneInput.addEventListener('keydown', handleKeyDown);
    
    // 存储事件处理器，以便后续清理
    card.setAttribute('data-keydown-handler', 'true');
}

// 保存编辑
function savePhraseEdit(id) {
    const card = document.querySelector(`.phrase-card[data-id="${id}"]`);
    if (!card) return;
    
    const englishInput = card.querySelector('.english-input');
    const chineseInput = card.querySelector('.chinese-input');
    const sceneInput = card.querySelector('.scene-input');
    
    const english = englishInput.value.trim();
    const chinese = chineseInput.value.trim();
    const scene = sceneInput.value.trim();
    
    if (!english || !chinese || !scene) {
        alert('所有字段都不能为空');
        return;
    }
    
    const phrase = phrases.find(p => p.id === id);
    if (phrase) {
        phrase.english = english;
        phrase.chinese = chinese;
        phrase.scene = scene;
        savePhrases();
    }
    
    // 取消编辑模式（刷新显示）
    cancelEdit(id);
}

// 取消编辑
function cancelEdit(id) {
    const card = document.querySelector(`.phrase-card[data-id="${id}"]`);
    if (!card) return;
    
    const phrase = phrases.find(p => p.id === id);
    if (!phrase) return;
    
    // 恢复文本显示，隐藏输入框
    const englishText = card.querySelector('.english-text');
    const chineseText = card.querySelector('.chinese-text');
    const sceneText = card.querySelector('.scene-text');
    const englishInput = card.querySelector('.english-input');
    const chineseInput = card.querySelector('.chinese-input');
    const sceneInput = card.querySelector('.scene-input');
    
    // 恢复原始值
    englishInput.value = phrase.english;
    chineseInput.value = phrase.chinese;
    sceneInput.value = phrase.scene;
    
    englishText.textContent = phrase.english;
    chineseText.textContent = phrase.chinese;
    sceneText.textContent = phrase.scene;
    
    englishText.style.display = 'block';
    chineseText.style.display = 'block';
    sceneText.style.display = 'block';
    englishInput.style.display = 'none';
    chineseInput.style.display = 'none';
    sceneInput.style.display = 'none';
    
    // 显示编辑和删除按钮，隐藏保存和取消按钮
    const editBtn = card.querySelector('.btn-edit-phrase');
    const saveBtn = card.querySelector('.btn-save-phrase');
    const cancelBtn = card.querySelector('.btn-cancel-edit');
    const deleteBtn = card.querySelector('.btn-delete-phrase');
    
    editBtn.style.display = 'inline-flex';
    deleteBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// 删除短语
function deletePhrase(id) {
    if (confirm('确定要删除这个卡片吗？')) {
        const index = phrases.findIndex(p => p.id === id);
        if (index !== -1) {
            phrases.splice(index, 1);
            savePhrases();
            renderPhrases();
        }
    }
}

// 切换到短语卡片界面
function switchToCardsView() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.view');
    
    navTabs.forEach(tab => {
        if (tab.getAttribute('data-view') === 'cards') {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    views.forEach(view => {
        if (view.id === 'cards-view') {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
}

// 视图切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载短语数据
    loadPhrases();
    
    // 视图切换
    const navTabs = document.querySelectorAll('.nav-tab');
    const views = document.querySelectorAll('.view');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            
            // 移除所有活动状态
            navTabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // 添加活动状态
            this.classList.add('active');
            document.getElementById(`${targetView}-view`).classList.add('active');
        });
    });
    
    // 表单提交
    const phraseForm = document.getElementById('phrase-form');
    if (phraseForm) {
        phraseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const englishInput = document.getElementById('english-phrase');
            const chineseInput = document.getElementById('chinese-translation');
            const sceneInput = document.getElementById('scene');
            
            const english = englishInput.value.trim();
            const chinese = chineseInput.value.trim();
            const scene = sceneInput.value.trim();
            
            if (english && chinese && scene) {
                addPhrase(english, chinese, scene);
                
                // 清空表单
                englishInput.value = '';
                chineseInput.value = '';
                sceneInput.value = '';
                englishInput.focus();
            }
        });
    }
    
    // 搜索框事件监听
    const searchInput = document.getElementById('scene-search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            filterPhrases();
        });
        
        // 清空搜索时重置
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.target.value = '';
                searchQuery = '';
                filterPhrases();
            }
        });
    }
    
    // 按钮事件委托
    document.addEventListener('click', function(e) {
        // 编辑按钮
        if (e.target.closest('.btn-edit-phrase')) {
            const button = e.target.closest('.btn-edit-phrase');
            const id = parseInt(button.getAttribute('data-id'));
            editPhrase(id);
        }
        
        // 保存按钮
        if (e.target.closest('.btn-save-phrase')) {
            const button = e.target.closest('.btn-save-phrase');
            const id = parseInt(button.getAttribute('data-id'));
            savePhraseEdit(id);
        }
        
        // 取消编辑按钮
        if (e.target.closest('.btn-cancel-edit')) {
            const button = e.target.closest('.btn-cancel-edit');
            const id = parseInt(button.getAttribute('data-id'));
            cancelEdit(id);
        }
        
        // 删除卡片按钮
        if (e.target.closest('.btn-delete-phrase')) {
            const button = e.target.closest('.btn-delete-phrase');
            const id = parseInt(button.getAttribute('data-id'));
            deletePhrase(id);
        }
    });
    
    // 庆祝图片关闭按钮
    const celebrationClose = document.getElementById('celebration-close');
    const celebrationModal = document.getElementById('celebration-modal');
    
    if (celebrationClose) {
        celebrationClose.addEventListener('click', hideCelebration);
    }
    
    if (celebrationModal) {
        // 点击模态框背景关闭
        celebrationModal.addEventListener('click', function(e) {
            if (e.target === celebrationModal) {
                hideCelebration();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && celebrationModal.style.display === 'flex') {
                hideCelebration();
            }
        });
    }
});

