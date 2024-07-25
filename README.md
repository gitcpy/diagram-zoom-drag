1. About
   
	In obsidian, when you have a md file which contains large charts or diagrams, maybe something else of mermaid, you will see those things are too large to show completely in mermaid window. 
	So i think it is a good way to take the obsidian plugin here. It adapts those things of mermaid, and it could easily that let you zoom in or zoom-out or drag. Enjoy it!
	
2. Get it
   
	2.1 From Github
	
	2.1.1 Download
	
	Download code zip file and unzip it, or you just pull it from github. Anyway you like. Then you will get a doc named mermaid-zoom-drag-plugin.
	
	2.1.2 Install
	
	Just put the doc in the position, if your system is windows, it will be like this "your_obsidian_vault_path/.obsidian/plugins/mermaid-zoom-drag-plug".
	
	Reload your obsidian app, and you will see the option in "community plugins" -> "installed plugins", and click the switcher.
	
	2.2 From Obsidian Community Plugin Browser
   
	(to be continued...)
	
3. Usage
	
	After installed, When you read in obsidian, if there ia any mermaid, you just put your cursor inside it in reading mode.
	
	Press "Ctrl" and srolling up or down to zoom in or out.

	Press left button and move your cursur to drag it.

4. Example

   	4.1 Mermaid code

	```mermaid
	graph TD
 		X[测试mermaid流程图]
	    A[提出报废申请] --> B[审核报废申请]
	    B --> C{是否通过}
	    C -->|通过| D[安排报废]
	    D --> E[执行报废]
	    E --> F[记录报废]
	    C -->|不通过| G[记录拒绝理由]
	```

	4.2 Click the copy button at right top of the mermaid diagrams above to copy the code, and paste it above in your md file in obsidian, try as "3. Usage".
