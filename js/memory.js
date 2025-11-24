// 保存记忆
async function saveMemory() {
    const content = document.getElementById('memory-input').value.trim();
    
    if (!content) {
        showMessage('请输入内容', 'error');
        return;
    }

    // 显示加载状态
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '投递中...';
    saveBtn.disabled = true;

    try {
        const Memory = AV.Object.extend('Memory');
        const memory = new Memory();
        
        // 设置 ACL 权限 - 允许所有人读写
        const acl = new AV.ACL();
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(true);
        memory.setACL(acl);
        
        // 设置数据
        memory.set('content', content);
        memory.set('author', '匿名用户');
        
        // 保存到云端
        await memory.save();
        
        showMessage('✨ 记忆已投入时光瓶！', 'success');
        document.getElementById('memory-input').value = '';
        
    } catch (error) {
        console.error('保存失败:', error);
        showMessage('❌ 保存失败：' + error.message, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// 捞取记忆
async function fetchMemory() {
    const fetchBtn = document.querySelector('.fetch-btn');
    const originalText = fetchBtn.textContent;
    fetchBtn.textContent = '捞取中...';
    fetchBtn.disabled = true;

    try {
        const query = new AV.Query('Memory');
        const count = await query.count();
        
        if (count === 0) {
            showMessage('🌊 时光瓶是空的，快去投递第一条记忆吧！', 'info');
            return;
        }
        
        // 随机获取一条
        const randomIndex = Math.floor(Math.random() * count);
        query.skip(randomIndex);
        query.limit(1);
        
        const result = await query.first();
        
        if (result) {
            const content = result.get('content');
            const author = result.get('author') || '匿名用户';
            const date = result.createdAt;
            
            displayMemory(content, author, date);
        } else {
            showMessage('🌊 没有捞到记忆，再试一次吧！', 'info');
        }
        
    } catch (error) {
        console.error('捞取失败:', error);
        showMessage('❌ 捞取失败：' + error.message, 'error');
    } finally {
        fetchBtn.textContent = originalText;
        fetchBtn.disabled = false;
    }
}

// 显示记忆
function displayMemory(content, author, date) {
    const memoryDisplay = document.getElementById('memory-display');
    const formattedDate = date.toLocaleDateString('zh-CN');
    
    memoryDisplay.innerHTML = `
        <div class="memory-card">
            <div class="memory-content">${escapeHtml(content)}</div>
            <div class="memory-meta">
                <span class="memory-author">来自：${escapeHtml(author)}</span>
                <span class="memory-date">${formattedDate}</span>
            </div>
        </div>
    `;
    
    memoryDisplay.style.display = 'block';
    
    // 添加动画效果
    memoryDisplay.classList.add('fade-in');
    setTimeout(() => {
        memoryDisplay.classList.remove('fade-in');
    }, 500);
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 移除已存在的消息
    const existingMsg = document.querySelector('.message-toast');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `message-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HTML 转义，防止 XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 回车键提交
document.getElementById('memory-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveMemory();
    }
});


