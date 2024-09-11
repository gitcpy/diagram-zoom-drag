Demo:
![](https://github.com/gitcpy/obsidian-mermaid-pop/blob/main/gifs/mermaid-zoom-drag-demo.gif)

1. About
   
	In obsidian, when you have a md file which contains large charts or diagrams, maybe something else of mermaid, you will see those things are too large to show completely in mermaid window. 
	So i think it is a good way to take the obsidian plugin here. It adapts those things of mermaid, and it could easily that let you zoom in or zoom-out or drag. Enjoy it!
	
2. Get it
   
	2.1 From Github
	
	2.1.1 Download and Install
	
 	Way 1.
	
	 	Download code zip file and unzip it, or you just pull it from github.
	 
		Anyway you like. Then you will get a doc named mermaid-zoom-drag-main, rename it to mermain-zoom-drag-main.
		
		Just put the doc in the position, if your system is windows, it will be like this "your_obsidian_vault_path/.obsidian/plugins/mermaid-zoom-drag-plug".
		
		Reload your obsidian app, and you will see the option in "community plugins" -> "installed plugins", and click the switcher.

   	Way 2.

	   	Also you could get it by BRAT plugin from the "Community plugins" in Obsidian.
	   	
	   	Install BRAT plugin from the "Community plugins".
	   
		Go to the option or settings of it, click "Add Beta Plugin", and then fill in the repository textbox: https://github.com/gitcpy/mermaid-zoom-drag.git.
	
	   	After that, click "Add plugin". A moment later, you will see the plugin in the list of installed plugins. Just enable if you in need, or disable it.
 
	Way 3. 
		Directly From Obsidian Community Plugin Browser
   
		(to be continued...)
		
3. Usage
	
	After installed, When you read in obsidian, if there ia any mermaid, you just put your cursor inside it in reading mode.
	
	Press "Ctrl" and srolling up or down to zoom in or out.

	Press left button and move your cursur to drag it.

	----20240909,  a control panel at left right corner by Ssentiago
   
	It provides functionality for zooming and moving the view of the diagrams.
	
	Movement Controls:
	
	Movement Buttons: up-left, up, up-right, left, right, down-left, down, down-right. Each button shifts the diagram by a set distance, allowing for precise repositioning within its container. And an eye button in the center which could hides or shows the move and zoom panels.

	Zoom Controls:

	Zoom Buttons: zooming in, zooming out, and resetting zoom and position to adjust the scale of the diagram relative to its container, enabling users to zoom in or out as needed.
	Reset button restores the diagram to its original size and position.

5. Example

   	4.1 Mermaid code

	```mermaid
	flowchart LR
	Test_Mermaid_Diagram
	Start --> Stop
	```

	4.2 Click the copy button at right top of the mermaid diagrams above to copy the code, and paste it in your md file in obsidian, and try as "3. Usage".
