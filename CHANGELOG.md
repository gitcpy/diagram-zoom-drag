# 4.2.7
## Features
- Added the `Toggle panel visibility` command to the command palette, allowing users to toggle the panel state in the active diagram.
- Users can now assign a custom hotkey for this command in the Obsidian settings.
- Removed the outdated `CTRL + M` hotkey.

# 4.2.6
## Features
- Added three options for hiding panels in the plugin settings:
  - Hide panels when mouse leaves diagram
  - Hide panels when mouse leaves them
  - Hide panels by pressing Ctrl + M
- Removed the opacity control option

Related to #26

# 4.2.5
### Feature:
- Panels opacity now is at 10 by default

# 4.2.4
### Features
- Add show/hide buttons on mouse hover: buttons will be visible when the mouse is over the panel and transparent when the mouse leaves.
- Introduce a new options to set folding and opacity levels when hidden.
- Provide a default selector class for use by other plugins if needed.

### Bugfixes
- Resolve issue #25 related to background in fullscreen mode.
- Fix issue with maximum recursion depth in plugin settings when switching toggles.

# 4.2.3
### Feature
- Add diagram folding  
- Add button for diagram folding  
- Add folding option to the plugin settings:  
  - Fold by default  
  - Automatic folding/unfolding on focus change


# 4.2.2
Rename to diagram-zom-drag

# 4.2.1
### Feature
- Add input field validation when adding new diagram in the plugin settings

# 4.2.0
### Feature
- Added data saving for each diagram container in view, including position and zoom. Data persists even when switching between multiple views.
- Added support for new diagram types: tested with PlantUML and Graphviz.
- Added a plugin settings tab:
  - Option to add new diagram types: specify the name and div class.
  - Short user guide for finding divs (click on the extra button next to the "Add New Data" button).
  - List of all diagrams in the settings, with the ability to delete unnecessary ones.
  - Button to restore settings to default.

### Bugfix
- Restored plugin controls in live-preview mode.


# 4.1.50
### Feature

- Add support for [Mehrmaid](https://github.com/huterguier/obsidian-mehrmaid) diagrams
- Reorganize control panel:
  - **Service panel** at the top right corner:
    - Hide / show action: hide / show other panels
    - Open in fullscreen mode / exit fullscreen mode: enables or disables fullscreen mode for the diagram

  - **Zoom panel** at the right edge at the center:
    - Zoom in: zoom in the diagram
    - Reset zoom and position: reset zoom and position of the diagram
    - Zoom out: zoom out the diagram

  - **Move panel** at the bottom:
    - All actions move the diagram to the specified side

- Implement diagram management with keyboard (replicates the move panel's buttons behavior):
  - **Keyboard:**
    - `CTRL` + `+`/`=`: zoom in
    - `CTRL` + `-`: zoom out
    - `CTRL` + `0`: reset zoom and position
    - ArrowUp, ArrowDown, ArrowLeft, ArrowRight: moves the diagram to the specified side

# 4.1.49
Add featrue: the open button would be a close one when in fullscreen mode

# 4.1.48
add button for open diagram in fullscreen mode
add touch and pinch-to-zoom functionality for mobile devices

# 4.1.47
add an eye button to hide or display the control panel
align center elements in mermaid div
add mermaid-zoom-drag-demo.gif

# 4.1.46
remove document

# 4.1.45
Add a control panel to shift and zoom diagrams

# 4.1.44
use getActiveViewOfType

# 4.1.43
avoid assigning styles 

# 4.1.42
put code into main.ts

# 4.1.41
Use Markdownpostproccessor

# 4.0.38
del evt of resize and layout-change

# 4.0.37
remove the event in resize event
update the way to get version
update the description

# 4.0.36
update id, name and tag and remove authorUrl， add .gitignore file

# 4.0.35
fixed a bug that output incorrect version

# 4.0.34
Just make the mermaid test code less in readme file. But the code is the same as before, and also the function. Because its going to submit for obsidian offical, so i upgrade the version. 

# 4.0.33
release to submitssion to obsidian officail for sharing a little plugin for zoom or drag mermaid diagrams in obsidian.

