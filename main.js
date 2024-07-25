const { Plugin, PluginSettingTab, Setting  } = require('obsidian');

const ver = "4.0.35";
class MermaidZoomDragPlugin extends Plugin {
  onload() {
    console.log("Loading MermaidZoomDragPlugin V" + ver);

    // 添加对工作区事件的监听
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.initializeMermaidFeatures();
      })
    );

    // 添加对文件打开的监听
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        this.initializeMermaidFeatures();
      })
    );

    // 在初始布局准备好时调用一次
    this.app.workspace.onLayoutReady(() => {
      this.initializeMermaidFeatures();
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.initializeMermaidFeatures();
    });
  }

  initializeMermaidFeatures() {
    // 添加延时以确保所有内容都已加载完成
    setTimeout(() => {
      this.addMermaidContainers();
      this.addMouseEvents();
    }, 1000);
  }

  addMermaidContainers() {
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((el) => {
      if (!el.parentElement.classList.contains('mermaid-container')) {
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.position = 'relative';
        container.style.overflow = 'auto'; // 修改为自动滚动
        container.style.width = '100%';
        container.style.height = '100%';
        el.parentNode.insertBefore(container, el);
        container.appendChild(el);
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.transformOrigin = 'top left';
        el.style.cursor = 'grab';

        // 确保图表完全加载后进行缩放和适配操作
        setTimeout(() => {
          this.fitToContainer(el, container);
        }, 500);
      }
    });
  }

  fitToContainer(element, container) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const mermaidWidth = element.scrollWidth;
    const mermaidHeight = element.scrollHeight;

    let scale = containerWidth / mermaidWidth;
    element.style.transform = `scale(${scale})`; // 设置默认缩放比例

    // 调整容器高度以完全显示图表
    const scaledHeight = mermaidHeight * scale;
    container.style.height = `${scaledHeight}px`;

    // 确保图表居中显示
    const offsetY = (containerHeight - scaledHeight) / 2;
    element.style.top = `${Math.max(offsetY, 0)}px`;
    element.style.left = `0px`;
  }

  addMouseEvents() {
    let scale = 1;
    let startX, startY, initialX, initialY;
    let isDragging = false;

    const mermaidContainers = document.querySelectorAll('.mermaid-container');

    mermaidContainers.forEach((container) => {
      const mermaidElement = container.querySelector('.mermaid');

      // 检查并避免重复绑定事件
      if (!container.classList.contains('events-bound')) {
        container.classList.add('events-bound');

        container.addEventListener('wheel', (event) => {
          if (!event.ctrlKey) return;
          event.preventDefault();
          const rect = mermaidElement.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const offsetY = event.clientY - rect.top;

          const prevScale = scale;
          scale += event.deltaY * -0.001;
          scale = Math.min(Math.max(.125, scale), 4);

          // 计算新的位置以保持缩放中心在鼠标位置
          const dx = offsetX * (1 - scale / prevScale);
          const dy = offsetY * (1 - scale / prevScale);

          mermaidElement.style.transform = `scale(${scale})`;

          // 确保图表位置正确
          const currentTop = parseFloat(mermaidElement.style.top) || 0;
          const currentLeft = parseFloat(mermaidElement.style.left) || 0;
          mermaidElement.style.top = `${currentTop + dy}px`;
          mermaidElement.style.left = `${currentLeft + dx}px`;
        });

        container.addEventListener('mousedown', (event) => {
          if (event.button !== 0) return; // Only allow left mouse button

          isDragging = true;
          startX = event.clientX;
          startY = event.clientY;
          initialX = parseFloat(mermaidElement.style.left) || 0;
          initialY = parseFloat(mermaidElement.style.top) || 0;
          mermaidElement.style.cursor = 'grabbing';
          event.preventDefault();
        });

        container.addEventListener('mousemove', (event) => {
          if (!isDragging) return;
          const dx = event.clientX - startX;
          const dy = event.clientY - startY;
          mermaidElement.style.left = `${initialX + dx}px`;
          mermaidElement.style.top = `${initialY + dy}px`;
        });

        container.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            mermaidElement.style.cursor = 'grab';
          }
        });

        container.addEventListener('mouseleave', () => {
          if (isDragging) {
            isDragging = false;
            mermaidElement.style.cursor = 'grab';
          }
        });
      }
    });
  }

  onunload() {
    console.log("Unloading MermaidZoomDragPlugin V" + ver);
  }
}

module.exports = MermaidZoomDragPlugin;
