const { Plugin, PluginSettingTab, Setting } = require('obsidian');

class MermaidZoomDragPlugin extends Plugin {
  onload() {
    console.log("Loading MermaidZoomDragPlugin " + this.manifest.version);

    this.registerMarkdownPostProcessor((element, context) => {
      this.initializeMermaidFeatures(element);
    });

    // 监听模式切换事件
    this.registerEvent(this.app.workspace.on('layout-change', () => {
      const activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf) {
        const view = activeLeaf.view;
        if (view && view.getViewType() === 'markdown') {
          this.initializeMermaidFeatures(view.contentEl);
        }
      }
    }));
  }

  initializeMermaidFeatures(ele) {
    // 检查是否在编辑模式下
    const isEditing = ele.classList.contains('cm-s-obsidian');

    // 如果是编辑模式，查找 Mermaid 代码块
    if (isEditing) {
      const codeBlocks = ele.querySelectorAll('pre > code.language-mermaid');
      codeBlocks.forEach((block) => {
        const mermaidElement = document.createElement('div');
        mermaidElement.className = 'mermaid';
        mermaidElement.textContent = block.textContent;

        // 替换代码块
        block.parentNode.replaceWith(mermaidElement);

        // 渲染 Mermaid 图表
        mermaid.init(undefined, mermaidElement);

        // 处理缩放和拖拽功能
        this.addMermaidContainers(mermaidElement);
        this.addMouseEvents(mermaidElement);
      });
    } else {
      // 阅读模式下，直接处理渲染后的元素
      setTimeout(() => {
        this.addMermaidContainers(ele);
        this.addMouseEvents(ele);
      }, 100);
    }
  }

  addMermaidContainers(ele) {
    const mermaidElements = ele.doc ? ele.doc.querySelectorAll('.mermaid') : ele.querySelectorAll('.mermaid');
    mermaidElements.forEach((el) => {
      if (!el.parentElement.classList.contains('mermaid-container')) {
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.position = 'relative';
        container.style.overflow = 'auto';
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
        }, 100);
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

  addMouseEvents(ele) {
    let scale = 1;
    let startX, startY, initialX, initialY;
    let isDragging = false;

    const isEditing = ele.classList.contains('cm-s-obsidian');
    const mermaidContainers = isEditing ? ele.querySelectorAll('.mermaid') : ele.doc.querySelectorAll('.mermaid-container');

    mermaidContainers.forEach((container) => {
      const mermaidElement = isEditing ? container : container.querySelector('.mermaid');

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

          const dx = offsetX * (1 - scale / prevScale);
          const dy = offsetY * (1 - scale / prevScale);

          mermaidElement.style.transform = `scale(${scale})`;

          const currentTop = parseFloat(mermaidElement.style.top) || 0;
          const currentLeft = parseFloat(mermaidElement.style.left) || 0;
          mermaidElement.style.top = `${currentTop + dy}px`;
          mermaidElement.style.left = `${currentLeft + dx}px`;
        });

        container.addEventListener('mousedown', (event) => {
          if (event.button !== 0) return;

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
    console.log("Unloading MermaidZoomDragPlugin " + this.manifest.version);
  }
}

module.exports = MermaidZoomDragPlugin;
