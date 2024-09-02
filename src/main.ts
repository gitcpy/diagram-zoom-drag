import { Plugin, MarkdownView } from 'obsidian';

export default class MermaidZoomDragPlugin extends Plugin {
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
          const markdownView = view as MarkdownView;
          const contentElement = markdownView.contentEl;
          this.initializeMermaidFeatures(contentElement);
        }
      }
    }));
  }

  initializeMermaidFeatures(ele: HTMLElement) {
    const observer = new MutationObserver(() => {
      this.initializeMermaidElements(ele);
    });
  
    observer.observe(ele, { childList: true, subtree: true });
  
    // 首次初始化
    this.initializeMermaidElements(ele);
  }
  

  initializeMermaidElements(ele: HTMLElement) {
    // 检查是否在编辑模式下
    const isEditing = ele.classList.contains('cm-s-obsidian');

    // 如果是编辑模式，查找 Mermaid 代码块
    if (isEditing) {
      const codeBlocks = ele.querySelectorAll('pre > code.language-mermaid');
      codeBlocks.forEach((block) => {
        const mermaidElement = document.createElement('div');
        mermaidElement.className = 'mermaid';
        mermaidElement.textContent = block.textContent || '';

        // 替换代码块
        if (block.parentNode)
        {
          const block_parentNode_Element = block.parentNode as Element;
          block_parentNode_Element.replaceWith(mermaidElement);
        }

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

  addMermaidContainers(ele: HTMLElement) {
    const mermaidElements = ele.querySelectorAll('.mermaid');
    mermaidElements.forEach((el) => {
      if (!el.parentElement?.classList.contains('mermaid-container')) {
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.setCssStyles({
          position: 'relative',
          overflow: 'auto',
          width: '100%',
          height: '100%'
        });

        el.parentNode?.insertBefore(container, el);
        container.appendChild(el);
        const el_html = el as HTMLElement;   
        el_html.setCssStyles({
          position: 'absolute',
          top: '0',
          left: '0',
          transformOrigin: 'top left',
          cursor: 'grab'
        });

        // 确保图表完全加载后进行缩放和适配操作
        setTimeout(() => {
          this.fitToContainer(el as HTMLElement, container);
        }, 100);
      }
    });
  }

  fitToContainer(element: HTMLElement, container: HTMLElement) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const mermaidWidth = element.scrollWidth;
    const mermaidHeight = element.scrollHeight;

    let scale = containerWidth / mermaidWidth;
    element.setCssStyles({
      transform: `scale(${scale})`// 设置默认缩放比例
    });

    // 调整容器高度以完全显示图表
    const scaledHeight = mermaidHeight * scale;
    container.setCssStyles({
      height: `${scaledHeight}px`
    });

    // 确保图表居中显示
    const offsetY = (containerHeight - scaledHeight) / 2;
    element.setCssStyles({
      top: `${Math.max(offsetY, 0)}px`,
      left: `0px`
    });    
  }

  addMouseEvents(ele: HTMLElement) {
    let scale = 1;
    let startX: number, startY: number, initialX: number, initialY: number;
    let isDragging = false;

    const isEditing = ele.classList.contains('cm-s-obsidian');
    const mermaidContainers = isEditing ? ele.querySelectorAll('.mermaid') : ele.querySelectorAll('.mermaid-container');

    mermaidContainers.forEach((container) => {
      const mermaidElement = isEditing ? container : container.querySelector('.mermaid') as HTMLElement;
      const md_HTMLElement = mermaidElement as HTMLElement;

      if (!container.classList.contains('events-bound')) {
        container.classList.add('events-bound');

        container.addEventListener('wheel', (event) => {
          const event_WheelEvent = event as WheelEvent;
          if (!event_WheelEvent.ctrlKey) return;
          event_WheelEvent.preventDefault();
          const rect = mermaidElement.getBoundingClientRect();
          const offsetX = event_WheelEvent.clientX - rect.left;
          const offsetY = event_WheelEvent.clientY - rect.top;

          const prevScale = scale;
          scale += event_WheelEvent.deltaY * -0.001;
          scale = Math.min(Math.max(.125, scale), 4);

          const dx = offsetX * (1 - scale / prevScale);
          const dy = offsetY * (1 - scale / prevScale);

          const win_ele_style = md_HTMLElement.win.getComputedStyle(md_HTMLElement);
          md_HTMLElement.setCssStyles({
            transform: `scale(${scale})`,
            top: `${(parseFloat(win_ele_style.top) || 0) + dy}px`,
            left: `${(parseFloat(win_ele_style.left) || 0) + dx}px`
          });

        });

        container.addEventListener('mousedown', (event) => {
          const event_MouseEvent = event as MouseEvent;
          if (event_MouseEvent.button !== 0) return;

          isDragging = true;
          const win_ele_style = md_HTMLElement.win.getComputedStyle(md_HTMLElement);
          startX = event_MouseEvent.clientX;
          startY = event_MouseEvent.clientY;

          initialX = parseFloat(win_ele_style.left) || 0;
          initialY = parseFloat(win_ele_style.top) || 0;
          md_HTMLElement.setCssStyles({
            cursor: 'grabbing'
          });
          event.preventDefault();
        });

        container.addEventListener('mousemove', (event) => {
          if (!isDragging) return;

          const event_MouseEvent = event as MouseEvent;
          const dx = event_MouseEvent.clientX - startX;
          const dy = event_MouseEvent.clientY - startY;
          md_HTMLElement.setCssStyles({
            left: `${initialX + dx}px`,
            top: `${initialY + dy}px`
          });
        });

        container.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            md_HTMLElement.setCssStyles({cursor: 'grab'});
          }
        });

        container.addEventListener('mouseleave', () => {
          if (isDragging) {
            isDragging = false;
            md_HTMLElement.setCssStyles({cursor : 'grab'});
          }
        });
      }
    });
  }
}
