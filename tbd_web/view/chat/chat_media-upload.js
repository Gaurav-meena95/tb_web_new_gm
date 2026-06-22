// Unified Media Upload Handler with Quality Preservation
function renderMediaUploadPage(uploadType, accType) {
	// State variables for tracking media type
	let isVideoMode = false;
	let videoHandler = null;
	var accFileTypes = "image/*";

	if (accType) {
		accFileTypes = accType;
	}
	
	
	
	

	var htmlPage = `<div class="media-upload__container">
						<!-- Header -->
						<div class="media-upload__header">
							<h1 class="media-upload__title">Upload your Media here</h1>
							<p class="media-upload__subtitle">Upload, edit, and share your photos and videos with our powerful tools. Add text, emojis, filters to images.</p>
						</div>

						<!-- Upload Area -->
						<div id="uploadArea" class="uploader animate-fade">
							<div class="uploader__area">
							<div class="uploader__icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="8.5" cy="8.5" r="1.5"></circle>
								<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
							</div>
							<div class="uploader__text">
								<h3 class="uploader__heading">Share your media here</h3>
								<p class="uploader__description">To create your perfect post</p>
							</div>
							<button id="selectButton" class="btn btn--gradient">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line x1="12" y1="3" x2="12" y2="15"></line>
								</svg>
								Select Media
							</button>
							<input type="file" id="fileInput" accept="${accFileTypes}" class="media-upload__hidden">
							</div>
						</div>

						<!-- Image Editor Area -->
						<div id="imageEditorArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Edit Image</h2>
							<button id="cancelImageButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>

							<div class="editor__container">
							<div class="editor__main">
								<div class="preview">
								<img id="previewImage" class="preview__image" src="/placeholder.svg" alt="Preview">
								<canvas id="drawingCanvas" class="preview__canvas"></canvas>
								<div id="textOverlaysContainer"></div>
								<div id="emojiOverlaysContainer"></div>
								<button id="cropButton" class="preview__crop-btn">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
									<path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
									<path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
									</svg>
									Crop
								</button>
								</div>

								<div class="thumbnails" id="thumbnailsContainer">
								<!-- Thumbnails will be added here -->
								</div>
							</div>

							<div class="editor__sidebar">
								<div class="editor__tools">
								<div class="editor__tools-header">
									<div class="editor__tab" data-tab="draw">Draw</div>
									<div class="editor__tab" data-tab="text">Text</div>
									<div class="editor__tab" data-tab="emoji">Emoji</div>
									<div class="editor__tab" data-tab="filter">Filters</div>
								</div>

								<!-- Drawing Tools -->
								<div class="editor__tool-content" id="drawTab">
									<h3 class="editor__tool-title">Drawing Tools</h3>
									<div class="color-picker">
									<div class="color-picker__option color-picker__option--active" style="background-color: #ff0000;" data-color="#ff0000"></div>
									<div class="color-picker__option" style="background-color: #ff9900;" data-color="#ff9900"></div>
									<div class="color-picker__option" style="background-color: #ffff00;" data-color="#ffff00"></div>
									<div class="color-picker__option" style="background-color: #00ff00;" data-color="#00ff00"></div>
									<div class="color-picker__option" style="background-color: #0000ff;" data-color="#0000ff"></div>
									<div class="color-picker__option" style="background-color: #9900ff;" data-color="#9900ff"></div>
									<div class="color-picker__option" style="background-color: #ff00ff;" data-color="#ff00ff"></div>
									<div class="color-picker__option" style="background-color: #000000;" data-color="#000000"></div>
									<div class="color-picker__option" style="background-color: #ffffff;" data-color="#ffffff"></div>
									</div>
									
									<div class="brush-size">
									<label class="brush-size__label">Brush Size</label>
									<input type="range" id="brushSize" min="1" max="20" value="5">
									</div>

									<button id="undoDrawingBtn" class="btn btn--outline">Undo Last Stroke</button>
									<button id="clearDrawingBtn" class="btn btn--outline">Clear Drawing</button>
								</div>

								<!-- Text Tools -->
								<div class="editor__tool-content" id="textTab">
									<h3 class="editor__tool-title">Add Text</h3>
									<input type="text" id="textInput" class="text-input" placeholder="Enter your text here...">
									
									<div class="color-picker">
									<div class="color-picker__option color-picker__option--active" style="background-color: #ff0000;" data-color="#ff0000"></div>
									<div class="color-picker__option" style="background-color: #ff9900;" data-color="#ff9900"></div>
									<div class="color-picker__option" style="background-color: #ffff00;" data-color="#ffff00"></div>
									<div class="color-picker__option" style="background-color: #00ff00;" data-color="#00ff00"></div>
									<div class="color-picker__option" style="background-color: #0000ff;" data-color="#0000ff"></div>
									<div class="color-picker__option" style="background-color: #9900ff;" data-color="#9900ff"></div>
									<div class="color-picker__option" style="background-color: #ff00ff;" data-color="#ff00ff"></div>
									<div class="color-picker__option" style="background-color: #000000;" data-color="#000000"></div>
									<div class="color-picker__option" style="background-color: #ffffff;" data-color="#ffffff"></div>
									</div>
									
									<div class="text-options">
									<div class="text-options__font text-options__font--active" data-font="Arial">Arial</div>
									<div class="text-options__font" data-font="Verdana">Verdana</div>
									<div class="text-options__font" data-font="Georgia">Georgia</div>
									<div class="text-options__font" data-font="Courier New">Courier</div>
									<div class="text-options__font" data-font="Impact">Impact</div>
									</div>

									<button id="addTextBtn" class="btn">Add Text</button>
									<button id="clearTextBtn" class="btn btn--outline">Clear All Text</button>
								</div>

								<!-- Emoji Tools -->
								<div class="editor__tool-content" id="emojiTab">
									<h3 class="editor__tool-title">Add Emoji</h3>
									<div class="emoji-picker">
									<div class="emoji-picker__option">😀</div>
									<div class="emoji-picker__option">😍</div>
									<div class="emoji-picker__option">🥰</div>
									<div class="emoji-picker__option">😂</div>
									<div class="emoji-picker__option">🤣</div>
									<div class="emoji-picker__option">😊</div>
									<div class="emoji-picker__option">🙂</div>
									<div class="emoji-picker__option">😎</div>
									<div class="emoji-picker__option">🥳</div>
									<div class="emoji-picker__option">🤩</div>
									<div class="emoji-picker__option">😋</div>
									<div class="emoji-picker__option">👍</div>
									<div class="emoji-picker__option">👎</div>
									<div class="emoji-picker__option">👏</div>
									<div class="emoji-picker__option">🙌</div>
									<div class="emoji-picker__option">❤️</div>
									<div class="emoji-picker__option">💯</div>
									<div class="emoji-picker__option">🔥</div>
									<div class="emoji-picker__option">✨</div>
									<div class="emoji-picker__option">🎉</div>
									<div class="emoji-picker__option">🎁</div>
									<div class="emoji-picker__option">🎈</div>
									<div class="emoji-picker__option">🎂</div>
									</div>
									<button id="clearEmojisBtn" class="btn btn--outline">Clear All Emojis</button>
								</div>

								<!-- Filter Tools -->
								<div class="editor__tool-content" id="filterTab">
									<h3 class="editor__tool-title">Apply Filter</h3>
									<div class="filters__scroll">
									<div class="filters__list" id="filtersList">
										<!-- Filters will be added here by JavaScript -->
									</div>
									</div>
								</div>
								</div>

								<div class="caption">
								<label for="imageCaption" class="caption__label">Caption</label>
								<textarea id="imageCaption" class="caption__textarea" placeholder="Write a caption..."></textarea>
								</div>

								<div id="imageProgressContainer" class="progress media-upload__hidden">
								<div class="progress__bar">
									<div id="imageProgressFill" class="progress__fill"></div>
								</div>
								<p id="imageProgressText" class="progress__text">0%</p>
								</div>

								<div class="actions">
								<button id="shareImageButton" class="btn btn--gradient">Share</button>
								</div>
							</div>
							</div>
						</div>

						
						
						<!-- Video Editor Area -->
						<div id="videoEditorArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Edit Video</h2>
							<button id="cancelVideoButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>

							<div class="editor__container">
							<div class="editor__main">
								<div class="video-preview">
								<video id="videoPreview" width="100%" height="auto"></video>
								</div>
							</div>

							<div class="editor__sidebar">
								<div class="caption">
								<label for="videoCaption" class="caption__label">Caption</label>
								<textarea id="videoCaption" class="caption__textarea" placeholder="Write a caption..."></textarea>
								</div>

								<div id="videoProgressContainer" class="progress media-upload__hidden">
								<div class="progress__bar">
									<div id="videoProgressFill" class="progress__fill"></div>
								</div>
								<p id="videoProgressText" class="progress__text">0%</p>
								</div>

								<div class="actions">
								<button id="shareVideoButton" class="btn btn--gradient">Share</button>
								</div>
							</div>
							</div>
						</div>

						<!-- Cropper Area -->
						<div id="cropperArea" class="media-upload__hidden">
							<div class="editor__header">
							<h2 class="editor__title">Crop Image</h2>
							</div>

							<div class="cropper__tools">
							<div class="aspect-ratio-selector">
								<label>Aspect Ratio:</label>
								<select id="aspectRatioSelect">
								<option value="free">Free</option>
								<option value="1:1">Square (1:1)</option>
								<option value="4:3">Standard (4:3)</option>
								<option value="16:9">Widescreen (16:9)</option>
								<option value="3:2">Photo (3:2)</option>
								<option value="original">Original</option>
								</select>
							</div>
							<button id="rotateButton" class="btn btn--outline btn--icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="23 4 23 10 17 10"></polyline>
								<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
								</svg>
							</button>
							</div>
							<div class="cropper__ratio-indicator" id="cropperRatioIndicator">Free Crop</div>

							<div id="cropperContainer" class="cropper">
							<img id="cropperImage" class="cropper__image" src="/placeholder.svg" alt="Crop preview">
							<div class="cropper__overlay">
								<div id="cropWindow" class="cropper__window">
								<div class="cropper__handle cropper__handle--nw" data-handle="nw"></div>
								<div class="cropper__handle cropper__handle--ne" data-handle="ne"></div>
								<div class="cropper__handle cropper__handle--sw" data-handle="sw"></div>
								<div class="cropper__handle cropper__handle--se" data-handle="se"></div>
								</div>
							</div>
							</div>

							<div class="actions">
							<button id="cancelCropButton" class="btn btn--outline">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
								Cancel
							</button>
							
							<button id="resetToOriginalButton" class="btn btn--outline">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
								<path d="M3 3v5h5"></path>
								</svg>
								Reset to Original
							</button>
							
							<button id="applyCropButton" class="btn btn--gradient">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
								<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
								Apply Crop
							</button>
							</div>
						</div>
						
						<!-- Error Message Container -->
						<div id="errorMessageContainer" class="error-message-container media-upload__hidden">
							<div class="error-message">
							<div class="error-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
								</svg>
							</div>
							<p id="errorMessageText">An error occurred.</p>
							<button id="errorCloseButton" class="btn btn--outline btn--small">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
							</div>
						</div>
					</div>`;

	// Append to body
	jQuery("body").append(htmlPage);

	// DOM Elements - Upload
	var uploadArea = document.getElementById("uploadArea");
	var fileInput = document.getElementById("fileInput");
	var selectButton = document.getElementById("selectButton");

	// DOM Elements - Image Editor
	var imageEditorArea = document.getElementById("imageEditorArea");
	var previewImage = document.getElementById("previewImage");
	var cropButton = document.getElementById("cropButton");
	var cancelImageButton = document.getElementById("cancelImageButton");
	var shareImageButton = document.getElementById("shareImageButton");
	var imageCaption = document.getElementById("imageCaption");
	var imageProgressContainer = document.getElementById(
		"imageProgressContainer"
	);
	var imageProgressFill = document.getElementById("imageProgressFill");
	var imageProgressText = document.getElementById("imageProgressText");
	var filtersList = document.getElementById("filtersList");
	var thumbnailsContainer = document.getElementById("thumbnailsContainer");

	// DOM Elements - Video Editor
	var videoEditorArea = document.getElementById("videoEditorArea");
	var videoPreview = document.getElementById("videoPreview");
	var cancelVideoButton = document.getElementById("cancelVideoButton");
	var shareVideoButton = document.getElementById("shareVideoButton");
	var videoCaption = document.getElementById("videoCaption");
	var videoProgressContainer = document.getElementById(
		"videoProgressContainer"
	);
	var videoProgressFill = document.getElementById("videoProgressFill");
	var videoProgressText = document.getElementById("videoProgressText");

	// DOM Elements - Cropper
	var cropperArea = document.getElementById("cropperArea");
	var cropperImage = document.getElementById("cropperImage");
	var cropperContainer = document.getElementById("cropperContainer");
	var cropWindow = document.getElementById("cropWindow");
	var rotateButton = document.getElementById("rotateButton");
	var cancelCropButton = document.getElementById("cancelCropButton");
	var applyCropButton = document.getElementById("applyCropButton");
	var aspectRatioSelect = document.getElementById("aspectRatioSelect");
	var cropperRatioIndicator = document.getElementById("cropperRatioIndicator");
	var resetToOriginalButton = document.getElementById("resetToOriginalButton");

	// DOM Elements - Drawing
	var drawingCanvas = document.getElementById("drawingCanvas");
	var brushSize = document.getElementById("brushSize");
	var clearDrawingBtn = document.getElementById("clearDrawingBtn");
	var undoDrawingBtn = document.getElementById("undoDrawingBtn");

	// DOM Elements - Text
	var textInput = document.getElementById("textInput");
	var addTextBtn = document.getElementById("addTextBtn");
	var clearTextBtn = document.getElementById("clearTextBtn");
	var textOverlaysContainer = document.getElementById("textOverlaysContainer");

	// DOM Elements - Emoji
	var emojiOptions = document.querySelectorAll(".emoji-picker__option");
	var clearEmojisBtn = document.getElementById("clearEmojisBtn");
	var emojiOverlaysContainer = document.getElementById(
		"emojiOverlaysContainer"
	);

	// DOM Elements - Tool Tabs
	var toolTabs = document.querySelectorAll(".editor__tab");
	var toolContents = document.querySelectorAll(".editor__tool-content");

	// DOM Elements - Color Picker
	var colorOptions = document.querySelectorAll(
		".color-picker .color-picker__option"
	);

	// DOM Elements - Font Options
	var fontOptions = document.querySelectorAll(".text-options__font");

	// DOM Elements - Error Message
	var errorMessageContainer = document.getElementById("errorMessageContainer");
	var errorMessageText = document.getElementById("errorMessageText");
	var errorCloseButton = document.getElementById("errorCloseButton");

	// State
	let selectedFiles = [];
	let currentFileIndex = 0;
	let selectedFilter = "original";
	let rotation = 0;
	let cropArea = { x: 25, y: 25, width: 50, height: 50 }; // Default crop area (percentages)
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let activeHandle = null;
	let currentAspectRatio = "free"; // Default to free aspect ratio

	// Drawing state
	let isDrawing = false;
	let drawingContext = null;
	let currentColor = "#ff0000";
	let currentBrushSize = 5;
	let drawingData = [];
	let lastX = 0;
	let lastY = 0;
	let drawingEnabled = false; // Flag to control if drawing is enabled

	// Text state
	let currentFont = "Arial";
	let textOverlays = [];
	let activeTextOverlay = null;

	// Emoji state
	let emojiOverlays = [];
	let activeEmojiOverlay = null;

	// Image state
	let originalImages = []; // Store original images for each file
	let cropHistory = []; // Store crop history for undo operations
	let originalImageDimensions = []; // Store original image dimensions

	// Filters
	var filters = [
		{ id: "original", name: "Normal" },
		{ id: "filter--clarendon", name: "Clarendon" },
		{ id: "filter--gingham", name: "Gingham" },
		{ id: "filter--moon", name: "Moon" },
		{ id: "filter--lark", name: "Lark" },
		{ id: "filter--reyes", name: "Reyes" },
		{ id: "filter--juno", name: "Juno" },
		{ id: "filter--slumber", name: "Slumber" },
		{ id: "filter--crema", name: "Crema" },
		{ id: "filter--ludwig", name: "Ludwig" },
	];

	// Initialize
	// Setup event listeners for upload
	uploadArea.addEventListener("click", () => fileInput.click());
	fileInput.addEventListener("change", handleFileChange);
	selectButton.addEventListener("click", (e) => {
		e.stopPropagation();
		fileInput.click();
	});

	// Drag and drop
	uploadArea.addEventListener("dragover", handleDragOver);
	uploadArea.addEventListener("dragleave", handleDragLeave);
	uploadArea.addEventListener("drop", handleDrop);

	// Editor buttons
	cancelImageButton.addEventListener("click", resetUploader);
	cancelVideoButton.addEventListener("click", resetUploader);
	cropButton.addEventListener("click", startCropping);
	shareImageButton.addEventListener("click", () => handleUpload("image"));
	shareVideoButton.addEventListener("click", () => handleUpload("video"));

	// Cropper buttons
	rotateButton.addEventListener("click", rotateImage);
	cancelCropButton.addEventListener("click", cancelCropping);
	applyCropButton.addEventListener("click", applyCrop);
	resetToOriginalButton.addEventListener("click", resetToOriginal);

	// Aspect ratio selector
	aspectRatioSelect.addEventListener("change", updateAspectRatio);

	// Error message
	errorCloseButton.addEventListener("click", hideErrorMessage);

	// Cropper events
	cropWindow.addEventListener("mousedown", startDraggingCrop);
	cropWindow.addEventListener("touchstart", handleTouchStartCrop, {
		passive: false,
	});
	document.addEventListener("mousemove", handleDraggingCrop);
	document.addEventListener("touchmove", handleTouchMoveCrop, {
		passive: false,
	});
	document.addEventListener("mouseup", stopDraggingCrop);
	document.addEventListener("touchend", stopDraggingCrop);
	document.addEventListener("touchcancel", stopDraggingCrop);

	// Handle crop resize
	var handles = document.querySelectorAll(".cropper__handle");
	handles.forEach((handle) => {
		handle.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			activeHandle = handle.getAttribute("data-handle");
			startDraggingCrop(e);
		});
		handle.addEventListener("touchstart", (e) => {
			e.stopPropagation();
			activeHandle = handle.getAttribute("data-handle");
			handleTouchStartCrop(e);
		});
	});

	// Create filters
	createFilters();

	// Setup drawing canvas
	setupDrawingCanvas();
	clearDrawingBtn.addEventListener("click", clearDrawing);
	undoDrawingBtn.addEventListener("click", undoLastStroke);

	// Setup text tools
	addTextBtn.addEventListener("click", addTextOverlay);
	clearTextBtn.addEventListener("click", clearAllText);

	// Setup emoji tools
	emojiOptions.forEach((option) => {
		option.addEventListener("click", () => addEmojiOverlay(option.textContent));
	});
	clearEmojisBtn.addEventListener("click", clearAllEmojis);

	// Setup tool tabs
	toolTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			var tabName = tab.getAttribute("data-tab");
			setActiveTab(tabName);

			// Enable drawing only when the draw tab is active
			drawingEnabled = tabName === "draw";
		});
	});

	// Setup color picker
	colorOptions.forEach((option) => {
		option.addEventListener("click", () => {
			var color = option.getAttribute("data-color");
			setCurrentColor(color, option);
		});
	});

	// Setup font options
	fontOptions.forEach((option) => {
		option.addEventListener("click", () => {
			var font = option.getAttribute("data-font");
			setCurrentFont(font, option);
		});
	});

	// Setup brush size
	brushSize.addEventListener("input", () => {
		currentBrushSize = brushSize.value;
	});

	// Handle window resize
	window.addEventListener("resize", handleResize);

	// Open the File Picker
	setTimeout(() => {
		jQuery("#selectButton").click();
	}, 300);

	// Show error message
	function showErrorMessage(message) {
		errorMessageText.textContent = message;
		errorMessageContainer.classList.remove("media-upload__hidden");

		// Auto-hide after 5 seconds
		setTimeout(() => {
			hideErrorMessage();
		}, 5000);
	}

	// Hide error message
	function hideErrorMessage() {
		errorMessageContainer.classList.add("media-upload__hidden");
	}

	// Update aspect ratio
	function updateAspectRatio() {
		currentAspectRatio = aspectRatioSelect.value;

		// Update the indicator text
		switch (currentAspectRatio) {
			case "free":
				cropperRatioIndicator.textContent = "Free Crop";
				break;
			case "1:1":
				cropperRatioIndicator.textContent = "Square (1:1)";
				break;
			case "4:3":
				cropperRatioIndicator.textContent = "Standard (4:3)";
				break;
			case "16:9":
				cropperRatioIndicator.textContent = "Widescreen (16:9)";
				break;
			case "3:2":
				cropperRatioIndicator.textContent = "Photo (3:2)";
				break;
			case "original":
				cropperRatioIndicator.textContent = "Original Ratio";
				break;
		}

		// Recalculate crop area based on new aspect ratio
		recalculateCropArea();
	}

	// Recalculate crop area based on aspect ratio
	function recalculateCropArea() {
		if (currentAspectRatio === "free") {
			// No need to adjust, free form
			return;
		}

		if (
			currentAspectRatio === "original" &&
			originalImageDimensions[currentFileIndex]
		) {
			// Use original image aspect ratio
			const origWidth = originalImageDimensions[currentFileIndex].width;
			const origHeight = originalImageDimensions[currentFileIndex].height;
			const ratio = origWidth / origHeight;

			// Adjust crop area to match original ratio
			adjustCropAreaToRatio(ratio);
			return;
		}

		// Parse the aspect ratio
		let ratio = 1; // Default to square

		switch (currentAspectRatio) {
			case "1:1":
				ratio = 1;
				break;
			case "4:3":
				ratio = 4 / 3;
				break;
			case "16:9":
				ratio = 16 / 9;
				break;
			case "3:2":
				ratio = 3 / 2;
				break;
		}

		// Adjust crop area to match the selected ratio
		adjustCropAreaToRatio(ratio);
	}

	// Adjust crop area to match a specific ratio
	function adjustCropAreaToRatio(ratio) {
		// Get container dimensions
		const containerRect = cropperContainer.getBoundingClientRect();
		const containerRatio = containerRect.width / containerRect.height;

		// Calculate new crop dimensions
		let newWidth, newHeight;

		if (ratio > containerRatio) {
			// Width constrained
			newWidth = Math.min(80, cropArea.width); // Max 80% of container width
			newHeight = newWidth / ratio;
		} else {
			// Height constrained
			newHeight = Math.min(80, cropArea.height); // Max 80% of container height
			newWidth = newHeight * ratio;
		}

		// Center the crop window
		const newX = (100 - newWidth) / 2;
		const newY = (100 - newHeight) / 2;

		// Update crop area
		cropArea = {
			x: newX,
			y: newY,
			width: newWidth,
			height: newHeight,
		};

		// Update crop window
		updateCropWindow();
	}

	// Handle window resize
	function handleResize() {
		// Update canvas size when window is resized
		updateCanvasSize();

		// Reposition text and emoji overlays
		repositionOverlays();
	}

	// Reposition overlays after resize
	function repositionOverlays() {
		var previewRect = previewImage.getBoundingClientRect();

		// Reposition text overlays
		textOverlays.forEach((overlay) => {
			if (overlay.element.style.transform !== "none") {
				// If the overlay is still using transform, don't reposition
				return;
			}

			// Get current position as percentage of container
			var rect = overlay.element.getBoundingClientRect();
			var x = ((rect.left - previewRect.left) / previewRect.width) * 100;
			var y = ((rect.top - previewRect.top) / previewRect.height) * 100;

			// Update position
			overlay.element.style.left = `${x}%`;
			overlay.element.style.top = `${y}%`;
		});

		// Reposition emoji overlays
		emojiOverlays.forEach((overlay) => {
			if (overlay.element.style.transform !== "none") {
				// If the overlay is still using transform, don't reposition
				return;
			}

			// Get current position as percentage of container
			var rect = overlay.element.getBoundingClientRect();
			var x = ((rect.left - previewRect.left) / previewRect.width) * 100;
			var y = ((rect.top - previewRect.top) / previewRect.height) * 100;

			// Update position
			overlay.element.style.left = `${x}%`;
			overlay.element.style.top = `${y}%`;
		});
	}

	// Set active tab
	function setActiveTab(tabName) {
		// Remove active class from all tabs
		toolTabs.forEach((tab) => tab.classList.remove("editor__tab--active"));
		toolContents.forEach((content) =>
			content.classList.remove("editor__tool-content--active")
		);

		// Add active class to selected tab
		document
			.querySelector(`.editor__tab[data-tab="${tabName}"]`)
			.classList.add("editor__tab--active");
		document
			.getElementById(`${tabName}Tab`)
			.classList.add("editor__tool-content--active");
	}

	// Set current color
	function setCurrentColor(color, element) {
		currentColor = color;

		// Update active color in the current tab
		var activeTab = document
			.querySelector(".editor__tab.editor__tab--active")
			.getAttribute("data-tab");
		var tabContent = document.getElementById(`${activeTab}Tab`);
		var colorOptions = tabContent.querySelectorAll(".color-picker__option");

		colorOptions.forEach((option) =>
			option.classList.remove("color-picker__option--active")
		);
		element.classList.add("color-picker__option--active");
	}

	// Set current font
	function setCurrentFont(font, element) {
		currentFont = font;

		// Update active font
		fontOptions.forEach((option) =>
			option.classList.remove("text-options__font--active")
		);
		element.classList.add("text-options__font--active");
	}

	// Setup drawing canvas
	function setupDrawingCanvas() {
		var ctx = drawingCanvas.getContext("2d");
		drawingContext = ctx;

		// Set initial canvas size
		updateCanvasSize();

		// Drawing event listeners
		drawingCanvas.addEventListener("mousedown", startDrawing);
		drawingCanvas.addEventListener("touchstart", handleTouchStart, {
			passive: false,
		});

		// These events are added to the document to capture movement outside the canvas
		document.addEventListener("mousemove", draw);
		document.addEventListener("touchmove", handleTouchMove, { passive: false });
		document.addEventListener("mouseup", stopDrawing);
		document.addEventListener("touchend", handleTouchEnd);
		document.addEventListener("touchcancel", handleTouchEnd);
	}

	// Update canvas size to match the image
	function updateCanvasSize() {
		if (!previewImage.complete) {
			previewImage.onload = updateCanvasSize;
			return;
		}

		// Get the display dimensions of the preview image
		var displayRect = previewImage.getBoundingClientRect();

		// Set canvas display size to match the preview image display size
		drawingCanvas.style.width = `${displayRect.width}px`;
		drawingCanvas.style.height = `${displayRect.height}px`;

		// Set canvas internal dimensions to match the natural image size for better quality
		if (originalImageDimensions[currentFileIndex]) {
			drawingCanvas.width = originalImageDimensions[currentFileIndex].width;
			drawingCanvas.height = originalImageDimensions[currentFileIndex].height;
		} else {
			// Fallback to natural dimensions of the preview image
			drawingCanvas.width = previewImage.naturalWidth || displayRect.width;
			drawingCanvas.height = previewImage.naturalHeight || displayRect.height;
		}

		// Calculate the scale factor between display size and internal canvas size
		const scaleX = drawingCanvas.width / displayRect.width;
		const scaleY = drawingCanvas.height / displayRect.height;

		// Store the scale factors for use in drawing operations
		drawingCanvas.dataset.scaleX = scaleX;
		drawingCanvas.dataset.scaleY = scaleY;

		// Redraw any existing lines with proper scaling
		redrawCanvas();
	}

	// Start drawing
	function startDrawing(e) {
		e.preventDefault();

		// Only allow drawing if the draw tab is active
		if (!drawingEnabled) return;

		isDrawing = true;
		var rect = drawingCanvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		lastX = scaledX;
		lastY = scaledY;

		drawingContext.beginPath();
		drawingContext.moveTo(scaledX, scaledY);

		// Store the start of this line
		drawingData.push({
			type: "line",
			color: currentColor,
			size: currentBrushSize * Math.max(scaleX, scaleY), // Scale brush size
			points: [{ x: scaledX, y: scaledY }],
		});
	}

	// Draw
	function draw(e) {
		if (!isDrawing) return;

		var rect = drawingCanvas.getBoundingClientRect();
		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		// Check if mouse is within canvas bounds or close to last point
		if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
			drawingContext.lineTo(scaledX, scaledY);
			drawingContext.strokeStyle = currentColor;
			drawingContext.lineWidth = currentBrushSize * Math.max(scaleX, scaleY); // Scale brush size
			drawingContext.lineCap = "round";
			drawingContext.stroke();

			// Add point to current line
			drawingData[drawingData.length - 1].points.push({
				x: scaledX,
				y: scaledY,
			});

			lastX = scaledX;
			lastY = scaledY;
		}
	}

	// Stop drawing
	function stopDrawing() {
		isDrawing = false;
	}

	// Touch event handlers
	function handleTouchStart(e) {
		// Only allow drawing if the draw tab is active
		if (!drawingEnabled) return;

		e.preventDefault();
		var touch = e.touches[0];
		var rect = drawingCanvas.getBoundingClientRect();
		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		isDrawing = true;
		lastX = scaledX;
		lastY = scaledY;

		drawingContext.beginPath();
		drawingContext.moveTo(scaledX, scaledY);

		// Store the start of this line
		drawingData.push({
			type: "line",
			color: currentColor,
			size: currentBrushSize * Math.max(scaleX, scaleY), // Scale brush size
			points: [{ x: scaledX, y: scaledY }],
		});
	}

	function handleTouchMove(e) {
		if (!isDrawing) return;

		// Prevent scrolling only when drawing is active
		if (isDrawing) {
			e.preventDefault();
		}

		var touch = e.touches[0];
		var rect = drawingCanvas.getBoundingClientRect();
		var x = touch.clientX - rect.left;
		var y = touch.clientY - rect.top;

		// Scale the coordinates to match the internal canvas size
		const scaleX = parseFloat(drawingCanvas.dataset.scaleX) || 1;
		const scaleY = parseFloat(drawingCanvas.dataset.scaleY) || 1;

		const scaledX = x * scaleX;
		const scaledY = y * scaleY;

		// Check if touch is within canvas bounds or close to last point
		if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
			drawingContext.lineTo(scaledX, scaledY);
			drawingContext.strokeStyle = currentColor;
			drawingContext.lineWidth = currentBrushSize * Math.max(scaleX, scaleY); // Scale brush size
			drawingContext.lineCap = "round";
			drawingContext.stroke();

			// Add point to current line
			drawingData[drawingData.length - 1].points.push({
				x: scaledX,
				y: scaledY,
			});

			lastX = scaledX;
			lastY = scaledY;
		}
	}

	function handleTouchEnd(e) {
		isDrawing = false;
	}

	// Redraw canvas from stored data
	function redrawCanvas() {
		drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

		drawingData.forEach((line) => {
			if (line.points.length < 2) return;

			drawingContext.beginPath();
			drawingContext.moveTo(line.points[0].x, line.points[0].y);

			for (let i = 1; i < line.points.length; i++) {
				drawingContext.lineTo(line.points[i].x, line.points[i].y);
			}

			drawingContext.strokeStyle = line.color;
			drawingContext.lineWidth = line.size;
			drawingContext.lineCap = "round";
			drawingContext.stroke();
		});
	}

	// Clear drawing
	function clearDrawing() {
		drawingData = [];
		drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	}

	// Undo last stroke (LIFO - Last In First Out)
	function undoLastStroke() {
		if (drawingData.length > 0) {
			// Remove the last stroke from the array
			drawingData.pop();
			// Redraw the canvas with the remaining strokes
			redrawCanvas();
		}
	}

	// Add text overlay
	function addTextOverlay() {
		var text = textInput.value.trim();
		if (!text) return;

		var overlay = document.createElement("div");
		overlay.className = "text-overlay";
		overlay.style.left = "50%";
		overlay.style.top = "50%";
		overlay.style.transform = "translate(-50%, -50%)";

		var content = document.createElement("div");
		content.className = "text-overlay__content";
		content.textContent = text;
		content.style.color = currentColor;
		content.style.fontFamily = currentFont;

		overlay.appendChild(content);
		textOverlaysContainer.appendChild(overlay);

		// Store text overlay data
		var textData = {
			element: overlay,
			text: text,
			color: currentColor,
			font: currentFont,
			x: "50%",
			y: "50%",
		};

		textOverlays.push(textData);

		// Make draggable
		makeElementDraggable(overlay, textData);

		// Clear input
		textInput.value = "";
	}

	// Clear all text overlays
	function clearAllText() {
		textOverlays = [];
		textOverlaysContainer.innerHTML = "";
	}

	// Add emoji overlay
	function addEmojiOverlay(emoji) {
		var overlay = document.createElement("div");
		overlay.className = "emoji-overlay";
		overlay.style.left = "50%";
		overlay.style.top = "50%";
		overlay.style.transform = "translate(-50%, -50%)";

		var content = document.createElement("div");
		content.className = "emoji-overlay__content";
		content.textContent = emoji;

		overlay.appendChild(content);
		emojiOverlaysContainer.appendChild(overlay);

		// Store emoji overlay data
		var emojiData = {
			element: overlay,
			emoji: emoji,
			x: "50%",
			y: "50%",
		};

		emojiOverlays.push(emojiData);

		// Make draggable
		makeElementDraggable(overlay, emojiData);
	}

	// Clear all emoji overlays
	function clearAllEmojis() {
		emojiOverlays = [];
		emojiOverlaysContainer.innerHTML = "";
	}

	// Make element draggable
	function makeElementDraggable(element, data) {
		let offsetX, offsetY, startX, startY;

		element.addEventListener("mousedown", startDrag);
		element.addEventListener("touchstart", handleTouchStartDrag, {
			passive: false,
		});

		function startDrag(e) {
			e.preventDefault();

			// Deactivate any active overlay
			if (activeTextOverlay) {
				activeTextOverlay.classList.remove("text-overlay--active");
			}
			if (activeEmojiOverlay) {
				activeEmojiOverlay.classList.remove("emoji-overlay--active");
			}

			// Set this as active
			element.classList.add(
				element.classList.contains("text-overlay")
					? "text-overlay--active"
					: "emoji-overlay--active"
			);
			if (element.classList.contains("text-overlay")) {
				activeTextOverlay = element;
			} else {
				activeEmojiOverlay = element;
			}

			// Get initial position
			startX = e.clientX;
			startY = e.clientY;

			// Calculate offset
			var rect = element.getBoundingClientRect();
			offsetX = startX - rect.left;
			offsetY = startY - rect.top;

			// Add move and end event listeners
			document.addEventListener("mousemove", dragMove);
			document.addEventListener("mouseup", dragEnd);
		}

		function dragMove(e) {
			e.preventDefault();

			// Calculate new position
			var x = e.clientX - offsetX;
			var y = e.clientY - offsetY;

			// Update element position
			element.style.left = x + "px";
			element.style.top = y + "px";
			element.style.transform = "none";

			// Update data
			data.x = x + "px";
			data.y = y + "px";
		}

		function dragEnd() {
			document.removeEventListener("mousemove", dragMove);
			document.removeEventListener("mouseup", dragEnd);
		}

		// Touch support
		function handleTouchStartDrag(e) {
			e.preventDefault();
			var touch = e.touches[0];

			// Deactivate any active overlay
			if (activeTextOverlay) {
				activeTextOverlay.classList.remove("text-overlay--active");
			}
			if (activeEmojiOverlay) {
				activeEmojiOverlay.classList.remove("emoji-overlay--active");
			}

			// Set this as active
			element.classList.add(
				element.classList.contains("text-overlay")
					? "text-overlay--active"
					: "emoji-overlay--active"
			);
			if (element.classList.contains("text-overlay")) {
				activeTextOverlay = element;
			} else {
				activeEmojiOverlay = element;
			}

			// Get initial position
			startX = touch.clientX;
			startY = touch.clientY;

			// Calculate offset
			var rect = element.getBoundingClientRect();
			offsetX = startX - rect.left;
			offsetY = startY - rect.top;

			// Add move and end event listeners
			document.addEventListener("touchmove", handleTouchMoveDrag, {
				passive: false,
			});
			document.addEventListener("touchend", handleTouchEndDrag);
			document.addEventListener("touchcancel", handleTouchEndDrag);
		}

		function handleTouchMoveDrag(e) {
			e.preventDefault();
			var touch = e.touches[0];

			// Calculate new position
			var x = touch.clientX - offsetX;
			var y = touch.clientY - offsetY;

			// Update element position
			element.style.left = x + "px";
			element.style.top = y + "px";
			element.style.transform = "none";

			// Update data
			data.x = x + "px";
			data.y = y + "px";
		}

		function handleTouchEndDrag(e) {
			document.removeEventListener("touchmove", handleTouchMoveDrag);
			document.removeEventListener("touchend", handleTouchEndDrag);
			document.removeEventListener("touchcancel", handleTouchEndDrag);
		}
	}

	// Create filter options
	function createFilters() {
		filters.forEach((filter) => {
			var filterOption = document.createElement("div");
			filterOption.className = `filter ${
				filter.id === "original" ? "filter--active" : ""
			}`;
			filterOption.setAttribute("data-filter", filter.id);

			var filterPreview = document.createElement("div");
			filterPreview.className = "filter__preview";

			var filterPreviewInner = document.createElement("div");
			filterPreviewInner.className = `filter__preview-inner ${filter.id}`;

			var filterName = document.createElement("span");
			filterName.className = "filter__name";
			filterName.textContent = filter.name;

			filterPreview.appendChild(filterPreviewInner);
			filterOption.appendChild(filterPreview);
			filterOption.appendChild(filterName);

			filterOption.addEventListener("click", () => {
				document.querySelectorAll(".filter").forEach((el) => {
					el.classList.remove("filter--active");
				});
				filterOption.classList.add("filter--active");
				selectedFilter = filter.id;
				applyFilter();
			});

			filtersList.appendChild(filterOption);
		});
	}

	// Apply selected filter to preview image
	function applyFilter() {
		// Remove all filter classes
		filters.forEach((filter) => {
			previewImage.classList.remove(filter.id);
		});

		// Add selected filter class
		if (selectedFilter !== "original") {
			previewImage.classList.add(selectedFilter);
		}
	}

	// Handle file selection
	async function handleFileChange(e) {
		jQuery("#main, #singleChat").css("display", "none");
		jQuery(".media-upload__container").css("display", "block");

		var files = e.target.files || (e.dataTransfer && e.dataTransfer.files);

		if (!files || files.length === 0) return;

		// Clear previous files
		selectedFiles = [];
		originalImages = [];
		originalImageDimensions = [];

		// Process each file
		for (let i = 0; i < files.length; i++) {
			var file = files[i];

			// Validate file size
			if (file.size > 200 * 1024 * 1024) {
				// 20MB limit
				showErrorMessage(
					"File size exceeds 200MB limit. Please select a smaller file."
				);
				continue;
			}
			// Read the first 12 bytes of the file
			let buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());

			// Check if the file is a HEIC or HEIF image
			let type;
			if (
				file.type == "" ||
				file.type === "image/heic" ||
				file.type === "image/heif" ||
				(buffer.length > 11 &&
					buffer[4] === 0x66 &&
					buffer[5] === 0x74 &&
					buffer[6] === 0x79 &&
					buffer[7] === 0x70 &&
					((buffer[8] === 0x68 &&
						buffer[9] === 0x65 &&
						buffer[10] === 0x69 &&
						buffer[11] === 0x63) ||
						(buffer[8] === 0x68 &&
							buffer[9] === 0x65 &&
							buffer[10] === 0x69 &&
							buffer[11] === 0x66)))
			) {
				type = "HEIC/HEIF";
			} else {
				type = "image";
				console.log("File type is not supported");
			}
			// If the file is a HEIC or HEIF image
			if (type === "HEIC/HEIF") {
				showToast("Please wait while we load the image");
				let jpegFile = await convertHeicToJpegNew(file);
				file = jpegFile;
			}

			selectedFiles.push(file);
		}

		if (selectedFiles.length === 0) {
			showErrorMessage("Please select at least one valid file");
			return;
		}

		// Determine file type and show appropriate editor
		var file = selectedFiles[0];
		if (file.type.startsWith("image/")) {
			// Image file
			isVideoMode = false;

			// Show image editor area
			uploadArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.remove("media-upload__hidden");
			videoEditorArea.classList.add("media-upload__hidden");

			// Create thumbnails if multiple images
			if (selectedFiles.length > 1) {
				createThumbnails();
			}

			// Load first image
			loadImage(0);
		} else if (file.type.startsWith("video/")) {
			// Video file
			isVideoMode = true;

			// Show video editor area
			uploadArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.add("media-upload__hidden");
			videoEditorArea.classList.remove("media-upload__hidden");

			// Initialize video handler
			videoHandler = handleVideoAttachment(videoPreview, {
				allowTrim: true,
				allowVolumeControl: true,
				maxDuration: 120,
				showControls: false,
				autoPlay: false,
			});

			// Load video
			var url = URL.createObjectURL(file);
			videoHandler.initVideoPlayer(videoPreview, url, file);
		} else {
			showErrorMessage(
				"Unsupported file type. Please select an image or video file."
			);
			resetUploader();
		}
	}

	// Drag and drop handlers
	function handleDragOver(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.add("uploader__area--dragging");
	}

	function handleDragLeave(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.remove("uploader__area--dragging");
	}

	function handleDrop(e) {
		e.preventDefault();
		uploadArea
			.querySelector(".uploader__area")
			.classList.remove("uploader__area--dragging");
		handleFileChange(e);
	}

	// Create thumbnails
	function createThumbnails() {
		thumbnailsContainer.innerHTML = "";

		selectedFiles.forEach((file, index) => {
			if (!file.type.startsWith("image/")) return;

			var reader = new FileReader();
			reader.onload = (e) => {
				var thumbnail = document.createElement("div");
				thumbnail.className = `thumbnail ${
					index === 0 ? "thumbnail--active" : ""
				}`;
				thumbnail.setAttribute("data-index", index);

				var img = document.createElement("img");
				img.src = e.target.result;
				img.alt = `Thumbnail ${index + 1}`;

				var removeBtn = document.createElement("div");
				removeBtn.className = "thumbnail__remove";
				removeBtn.innerHTML = "×";
				removeBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					removeThumbnail(index);
				});

				thumbnail.appendChild(img);
				thumbnail.appendChild(removeBtn);
				thumbnailsContainer.appendChild(thumbnail);

				thumbnail.addEventListener("click", () => {
					loadImage(index);
				});
			};
			reader.readAsDataURL(file);
		});
	}

	// Remove thumbnail
	function removeThumbnail(index) {
		// Remove file from array
		selectedFiles.splice(index, 1);
		originalImages.splice(index, 1);
		originalImageDimensions.splice(index, 1);

		if (selectedFiles.length === 0) {
			// No more files, go back to upload area
			resetUploader();
			return;
		}

		// Recreate thumbnails
		createThumbnails();

		// Load current or previous image
		if (index <= currentFileIndex) {
			currentFileIndex = Math.max(0, currentFileIndex - 1);
		}

		loadImage(currentFileIndex);
	}

	// Load image with proper orientation and quality preservation
	function loadImage(index) {
		if (index < 0 || index >= selectedFiles.length) return;

		currentFileIndex = index;

		// Update active thumbnail
		document.querySelectorAll(".thumbnail").forEach((thumb) => {
			thumb.classList.remove("thumbnail--active");
		});

		var activeThumbnail = document.querySelector(
			`.thumbnail[data-index="${index}"]`
		);
		if (activeThumbnail) {
			activeThumbnail.classList.add("thumbnail--active");
		}

		// Show loading indicator
		previewImage.classList.add("loading");

		// Load image
		var reader = new FileReader();
		reader.onload = (e) => {
			// Store the original image if not already stored
			if (!originalImages[index]) {
				originalImages[index] = e.target.result;

				// Create an image to get the natural dimensions
				var img = new Image();
				img.onload = function () {
					originalImageDimensions[index] = {
						width: this.naturalWidth,
						height: this.naturalHeight,
					};

					// Now that we have the dimensions, update the canvas size
					updateCanvasSize();
				};
				img.src = e.target.result;
			}

			previewImage.src = e.target.result;

			// Reset canvas and overlays for the new image
			clearDrawing();
			clearAllText();
			clearAllEmojis();

			// Reset filter
			selectedFilter = "original";
			filters.forEach((filter) => {
				previewImage.classList.remove(filter.id);
			});

			// Update filter UI
			document.querySelectorAll(".filter").forEach((el) => {
				el.classList.remove("filter--active");
				if (el.getAttribute("data-filter") === "original") {
					el.classList.add("filter--active");
				}
			});

			// Update canvas size when image loads
			previewImage.onload = function () {
				updateCanvasSize();
				// Remove loading indicator
				previewImage.classList.remove("loading");
			};
		};
		reader.readAsDataURL(selectedFiles[index]);
	}

	// Reset uploader
	function resetUploader() {
		// Reset state
		selectedFiles = [];
		currentFileIndex = 0;
		selectedFilter = "original";
		rotation = 0;
		drawingData = [];
		textOverlays = [];
		emojiOverlays = [];
		isVideoMode = false;
		originalImages = []; // Clear original images
		originalImageDimensions = []; // Clear original dimensions
		cropHistory = []; // Clear crop history

		if (videoHandler) {
			// Clean up video handler
			videoHandler = null;
		}

		// Reset UI
		fileInput.value = "";
		previewImage.src = "";
		imageCaption.value = "";
		videoCaption.value = "";
		imageProgressFill.style.width = "0%";
		imageProgressText.textContent = "0%";
		videoProgressFill.style.width = "0%";
		videoProgressText.textContent = "0%";

		// Clear canvas
		if (drawingContext) {
			drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
		}

		// Clear overlays
		textOverlaysContainer.innerHTML = "";
		emojiOverlaysContainer.innerHTML = "";
		thumbnailsContainer.innerHTML = "";

		// Show upload area, hide editors
		uploadArea.classList.remove("media-upload__hidden");
		imageEditorArea.classList.add("media-upload__hidden");
		videoEditorArea.classList.add("media-upload__hidden");
		cropperArea.classList.add("media-upload__hidden");
		imageProgressContainer.classList.add("media-upload__hidden");
		videoProgressContainer.classList.add("media-upload__hidden");
		errorMessageContainer.classList.add("media-upload__hidden");

		// Reset filters
		document.querySelectorAll(".filter").forEach((el) => {
			el.classList.remove("filter--active");
			if (el.getAttribute("data-filter") === "original") {
				el.classList.add("filter--active");
			}
		});

		// Remove filter classes
		filters.forEach((filter) => {
			previewImage.classList.remove(filter.id);
		});
	}

	// Upload handling
	function handleUpload(mediaType) {
		if (selectedFiles.length === 0) return;

		if (mediaType === "image") {
			uploadImage();
		} else if (mediaType === "video") {
			uploadVideo();
		}
	}

	// Upload image with quality preservation
	function uploadImage() {
		// Show progress
		imageProgressContainer.classList.remove("media-upload__hidden");
		shareImageButton.disabled = true;
		shareImageButton.textContent = "Uploading...";

		try {
			// Create a canvas to combine the image with overlays and drawings
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			// Use the original image dimensions for the canvas to maintain quality
			var imgWidth, imgHeight;

			if (originalImageDimensions[currentFileIndex]) {
				imgWidth = originalImageDimensions[currentFileIndex].width;
				imgHeight = originalImageDimensions[currentFileIndex].height;
			} else {
				// Fallback to preview image dimensions
				imgWidth = previewImage.naturalWidth;
				imgHeight = previewImage.naturalHeight;
			}

			// Set canvas dimensions to match the original image
			canvas.width = imgWidth;
			canvas.height = imgHeight;

			// Draw the base image with applied filter
			var img = new Image();
			img.crossOrigin = "anonymous"; // Prevent CORS issues

			img.onload = () => {
				// Draw the base image at full resolution
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				// Apply the selected filter
				if (selectedFilter !== "original") {
					// Apply filter effects manually to the canvas
					applyFilterToCanvas(ctx, canvas.width, canvas.height, selectedFilter);
				}

				// Draw all lines from the drawing canvas
				// Scale the drawing canvas to match the output canvas
				ctx.drawImage(drawingCanvas, 0, 0, canvas.width, canvas.height);

				// Draw text overlays
				textOverlays.forEach((overlay) => {
					var previewRect = previewImage.getBoundingClientRect();
					var rect = overlay.element.getBoundingClientRect();

					// Calculate position as percentage of the preview
					var xPercent = (rect.left - previewRect.left) / previewRect.width;
					var yPercent = (rect.top - previewRect.top) / previewRect.height;

					// Convert percentage to actual pixels in the canvas
					var x = xPercent * canvas.width;
					var y = yPercent * canvas.height;

					// Scale font size based on canvas dimensions
					var fontSize = Math.max(14, Math.floor(canvas.width / 30)); // Adjust font size based on image width

					ctx.font = `${fontSize}px ${overlay.font}`;
					ctx.fillStyle = overlay.color;
					ctx.fillText(overlay.text, x, y + fontSize); // Add fontSize to y to position text correctly
				});

				// Draw emoji overlays
				emojiOverlays.forEach((overlay) => {
					var previewRect = previewImage.getBoundingClientRect();
					var rect = overlay.element.getBoundingClientRect();

					// Calculate position as percentage of the preview
					var xPercent = (rect.left - previewRect.left) / previewRect.width;
					var yPercent = (rect.top - previewRect.top) / previewRect.height;

					// Convert percentage to actual pixels in the canvas
					var x = xPercent * canvas.width;
					var y = yPercent * canvas.height;

					// Scale emoji size based on canvas dimensions
					var emojiSize = Math.max(30, Math.floor(canvas.width / 15)); // Adjust emoji size based on image width

					ctx.font = `${emojiSize}px Arial`;
					ctx.fillText(overlay.emoji, x, y + emojiSize); // Add emojiSize to y to position emoji correctly
				});

				// Convert the canvas to a blob with maximum quality
				canvas.toBlob(
					(blob) => {
						// Create a new File object from the blob
						var compositeFile = new File([blob], "edited-image.jpg", {
							type: "image/jpeg",
						});

						// Create FormData for upload
						var uploadData = new FormData();
						uploadData.append("uploaded_files", compositeFile);

						console.log(
							"Uploading composite file with all edits:",
							compositeFile
						);
						console.log("Caption With Image:", imageCaption.value);

						// Upload the composite image
						if (uploadType == "chatMedia") {
							var timestamp = Number(new Date().getTime() / 1000).toFixed(0);
							var userProfile = getProfileData();

							// Also append the user id to the form data
							uploadData.append(
								"data",
								JSON.stringify({
									userId: userProfile.userId,
									chatId: jQuery(".chat__header").data("chatId"),
									timeStamp: timestamp,
								})
							);

							jsUpload("uploadChatMedia", uploadData, {
								caption: imageCaption.value,
								onError: function (error) {
									showErrorMessage("Upload failed: " + error.message);
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Share";
									imageProgressContainer.classList.add("media-upload__hidden");
								},
							});
						} else {
							jsUpload("groupChatImage", uploadData, {
								onError: function (error) {
									showErrorMessage("Upload failed: " + error.message);
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Share";
									imageProgressContainer.classList.add("media-upload__hidden");
								},
							});
						}

						// Simulate upload progress
						let progress = 0;
						var progressInterval = setInterval(() => {
							progress += 5;
							if (progress >= 100) {
								clearInterval(progressInterval);

								// Show success
								shareImageButton.textContent = "Uploaded!";

								// Reset after delay
								setTimeout(() => {
									imageProgressContainer.classList.add("media-upload__hidden");
									shareImageButton.disabled = false;
									shareImageButton.textContent = "Share";

									// Go back to upload area
									resetUploader();
								}, 2000);

								return;
							}

							imageProgressFill.style.width = `${progress}%`;
							imageProgressText.textContent = `${progress}%`;
						}, 100);
					},
					"image/jpeg",
					1.0 // Maximum quality
				);
			};

			// Set the source of the image to the original image for maximum quality
			img.src = originalImages[currentFileIndex] || previewImage.src;
		} catch (error) {
			console.error("Error during image upload:", error);
			showErrorMessage("Error processing image: " + error.message);
			shareImageButton.disabled = false;
			shareImageButton.textContent = "Share";
			imageProgressContainer.classList.add("media-upload__hidden");
		}
	}

	// Apply filter effects to canvas
	function applyFilterToCanvas(ctx, width, height, filterId) {
		// This is a simplified implementation - in a real app, you'd implement more sophisticated filters
		switch (filterId) {
			case "filter--clarendon":
				// Increase contrast and saturation
				ctx.filter = "contrast(1.2) saturate(1.35)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--gingham":
				// Sepia and reduced saturation
				ctx.filter = "sepia(0.15) saturate(0.8)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--moon":
				// Grayscale with increased brightness
				ctx.filter = "grayscale(1) brightness(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--lark":
				// Brighten and increase contrast
				ctx.filter = "brightness(1.1) contrast(1.15)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--reyes":
				// Sepia and reduced contrast
				ctx.filter = "sepia(0.3) contrast(0.9) brightness(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				ctx.filter = "none";
				break;
			case "filter--juno":
				// Warm tint and increased saturation
				ctx.filter = "saturate(1.4)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 170, 0, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--slumber":
				// Warm tint and reduced saturation
				ctx.filter = "saturate(0.8) brightness(1.05)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 140, 0, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--crema":
				// Cream tint
				ctx.filter = "sepia(0.2) saturate(1.1)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a cream overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 250, 220, 0.15)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
			case "filter--ludwig":
				// Slight warm tint and reduced saturation
				ctx.filter = "saturate(0.9) brightness(1.05)";
				ctx.drawImage(ctx.canvas, 0, 0);
				// Add a warm overlay
				ctx.globalCompositeOperation = "overlay";
				ctx.fillStyle = "rgba(255, 235, 205, 0.1)";
				ctx.fillRect(0, 0, width, height);
				ctx.globalCompositeOperation = "source-over";
				ctx.filter = "none";
				break;
		}
	}

	// Upload video
	function uploadVideo() {
		if (!videoHandler) return;

		// Show progress
		videoProgressContainer.classList.remove("media-upload__hidden");
		shareVideoButton.disabled = true;
		shareVideoButton.textContent = "Uploading...";

		// Upload using the S3 integration
		videoHandler
			.uploadVideoToS3(uploadType, videoCaption.value)
			.then((response) => {
				console.log("Upload successful:", response);

				// Show success
				shareVideoButton.textContent = "Uploaded!";

				// Reset after delay
				setTimeout(() => {
					videoProgressContainer.classList.add("media-upload__hidden");
					shareVideoButton.disabled = false;
					shareVideoButton.textContent = "Share";

					// Go back to upload area
					resetUploader();
				}, 2000);
			})
			.catch((error) => {
				console.error("Upload failed:", error);
				showErrorMessage("Upload failed: " + error.message);

				// Reset button
				shareVideoButton.disabled = false;
				shareVideoButton.textContent = "Share";
				videoProgressContainer.classList.add("media-upload__hidden");
			});
	}

	// Start cropping with improved quality preservation
	function startCropping() {
		// Save current image state to history before cropping
		cropHistory.push(previewImage.src);

		// Use the original image for cropping to maintain quality
		cropperImage.src = originalImages[currentFileIndex] || previewImage.src;
		cropperImage.style.transform = `rotate(${rotation}deg)`;

		// Reset aspect ratio selector to free by default
		aspectRatioSelect.value = "free";
		currentAspectRatio = "free";
		cropperRatioIndicator.textContent = "Free Crop";

		// Wait for the image to load to calculate the proper crop area
		cropperImage.onload = () => {
			// Get the image dimensions
			var imgWidth = cropperImage.naturalWidth;
			var imgHeight = cropperImage.naturalHeight;

			// Calculate a default crop area (centered, 80% of the smaller dimension)
			var cropSize = Math.min(
				80,
				(Math.min(imgWidth, imgHeight) / Math.max(imgWidth, imgHeight)) * 80
			);

			if (imgWidth > imgHeight) {
				// Landscape image - center the crop horizontally
				var leftOffset = (100 - cropSize) / 2;
				cropArea = { x: leftOffset, y: 10, width: cropSize, height: cropSize };
			} else {
				// Portrait or square image - center the crop vertically
				var topOffset = (100 - cropSize) / 2;
				cropArea = { x: 10, y: topOffset, width: cropSize, height: cropSize };
			}

			// Update the crop window with the new dimensions
			updateCropWindow();
		};

		imageEditorArea.classList.add("media-upload__hidden");
		cropperArea.classList.remove("media-upload__hidden");
	}

	function cancelCropping() {
		cropperArea.classList.add("media-upload__hidden");
		imageEditorArea.classList.remove("media-upload__hidden");
	}

	function rotateImage() {
		rotation = (rotation + 90) % 360;
		cropperImage.style.transform = `rotate(${rotation}deg)`;
	}

	function startDraggingCrop(e) {
		e.preventDefault();
		isDragging = true;

		var rect = cropperContainer.getBoundingClientRect();
		dragStart = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	function handleTouchStartCrop(e) {
		e.preventDefault();
		isDragging = true;

		var touch = e.touches[0];
		var rect = cropperContainer.getBoundingClientRect();
		dragStart = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		};
	}

	function handleDraggingCrop(e) {
		if (!isDragging) return;

		var rect = cropperContainer.getBoundingClientRect();
		var containerWidth = rect.width;
		var containerHeight = rect.height;

		// Calculate deltas
		var deltaX = ((e.clientX - rect.left - dragStart.x) / containerWidth) * 100;
		var deltaY = ((e.clientY - rect.top - dragStart.y) / containerHeight) * 100;

		updateCropPosition(deltaX, deltaY);

		// Update drag start position
		dragStart = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	function handleTouchMoveCrop(e) {
		if (!isDragging) return;
		e.preventDefault();

		var touch = e.touches[0];
		var rect = cropperContainer.getBoundingClientRect();
		var containerWidth = rect.width;
		var containerHeight = rect.height;

		// Calculate deltas
		var deltaX =
			((touch.clientX - rect.left - dragStart.x) / containerWidth) * 100;
		var deltaY =
			((touch.clientY - rect.top - dragStart.y) / containerHeight) * 100;

		updateCropPosition(deltaX, deltaY);

		// Update drag start position
		dragStart = {
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top,
		};
	}

	function updateCropPosition(deltaX, deltaY) {
		if (activeHandle) {
			// Get aspect ratio if needed
			let aspectRatio = 1; // Default to 1:1

			if (currentAspectRatio !== "free") {
				switch (currentAspectRatio) {
					case "1:1":
						aspectRatio = 1;
						break;
					case "4:3":
						aspectRatio = 4 / 3;
						break;
					case "16:9":
						aspectRatio = 16 / 9;
						break;
					case "3:2":
						aspectRatio = 3 / 2;
						break;
					case "original":
						if (originalImageDimensions[currentFileIndex]) {
							aspectRatio =
								originalImageDimensions[currentFileIndex].width /
								originalImageDimensions[currentFileIndex].height;
						}
						break;
				}
			}

			// Resize from handle
			if (activeHandle === "nw") {
				// Northwest handle (top-left)
				let widthChange = -deltaX;
				let heightChange = -deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update x and width
				var newX = Math.max(
					0,
					Math.min(cropArea.x + cropArea.width - 10, cropArea.x - widthChange)
				);
				var newWidth = Math.max(
					10,
					Math.min(cropArea.width + widthChange, 100 - newX)
				);

				// Update y and height
				var newY = Math.max(
					0,
					Math.min(cropArea.y + cropArea.height - 10, cropArea.y - heightChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(cropArea.height + heightChange, 100 - newY)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (newY + newHeight > 100) {
						newHeight = 100 - newY;
						newWidth = newHeight * aspectRatio;
						newX = cropArea.x + cropArea.width - newWidth;
					}
				}

				cropArea = { x: newX, y: newY, width: newWidth, height: newHeight };
			} else if (activeHandle === "ne") {
				// Northeast handle (top-right)
				let widthChange = deltaX;
				let heightChange = -deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update width
				var newWidth = Math.max(
					10,
					Math.min(100 - cropArea.x, cropArea.width + widthChange)
				);

				// Update y and height
				var newY = Math.max(
					0,
					Math.min(cropArea.y + cropArea.height - 10, cropArea.y - heightChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(cropArea.height + heightChange, 100 - newY)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (newY + newHeight > 100) {
						newHeight = 100 - newY;
						newWidth = newHeight * aspectRatio;
					}
				}

				cropArea = {
					x: cropArea.x,
					y: newY,
					width: newWidth,
					height: newHeight,
				};
			} else if (activeHandle === "sw") {
				// Southwest handle (bottom-left)
				let widthChange = -deltaX;
				let heightChange = deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update x and width
				var newX = Math.max(
					0,
					Math.min(cropArea.x + cropArea.width - 10, cropArea.x - widthChange)
				);
				var newWidth = Math.max(
					10,
					Math.min(cropArea.width + widthChange, 100 - newX)
				);

				// Update height
				var newHeight = Math.max(
					10,
					Math.min(100 - cropArea.y, cropArea.height + heightChange)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (cropArea.y + newHeight > 100) {
						newHeight = 100 - cropArea.y;
						newWidth = newHeight * aspectRatio;
						newX = cropArea.x + cropArea.width - newWidth;
					}
				}

				cropArea = {
					x: newX,
					y: cropArea.y,
					width: newWidth,
					height: newHeight,
				};
			} else if (activeHandle === "se") {
				// Southeast handle (bottom-right)
				let widthChange = deltaX;
				let heightChange = deltaY;

				// Maintain aspect ratio if needed
				if (currentAspectRatio !== "free") {
					// Use the larger of the two changes to maintain aspect ratio
					if (Math.abs(widthChange) > Math.abs(heightChange * aspectRatio)) {
						heightChange = widthChange / aspectRatio;
					} else {
						widthChange = heightChange * aspectRatio;
					}
				}

				// Update width and height
				var newWidth = Math.max(
					10,
					Math.min(100 - cropArea.x, cropArea.width + widthChange)
				);
				var newHeight = Math.max(
					10,
					Math.min(100 - cropArea.y, cropArea.height + heightChange)
				);

				// If maintaining aspect ratio, adjust height based on width
				if (currentAspectRatio !== "free") {
					newHeight = newWidth / aspectRatio;

					// Check if height is within bounds
					if (cropArea.y + newHeight > 100) {
						newHeight = 100 - cropArea.y;
						newWidth = newHeight * aspectRatio;
					}
				}

				cropArea = {
					x: cropArea.x,
					y: cropArea.y,
					width: newWidth,
					height: newHeight,
				};
			}
		} else {
			// Move the entire crop window
			var newX = Math.max(
				0,
				Math.min(100 - cropArea.width, cropArea.x + deltaX)
			);
			var newY = Math.max(
				0,
				Math.min(100 - cropArea.height, cropArea.y + deltaY)
			);

			cropArea = { ...cropArea, x: newX, y: newY };
		}

		// Update crop window position
		updateCropWindow();
	}

	function stopDraggingCrop() {
		isDragging = false;
		activeHandle = null;
	}

	function updateCropWindow() {
		cropWindow.style.left = `${cropArea.x}%`;
		cropWindow.style.top = `${cropArea.y}%`;
		cropWindow.style.width = `${cropArea.width}%`;
		cropWindow.style.height = `${cropArea.height}%`;
	}

	// Apply crop with quality preservation
	function applyCrop() {
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		// Create a new image to get the original dimensions
		var img = new Image();
		img.crossOrigin = "anonymous"; // Prevent CORS issues

		img.onload = () => {
			// Get the natural dimensions of the image
			var imgWidth = img.naturalWidth;
			var imgHeight = img.naturalHeight;

			// Calculate the crop area in the original image coordinates
			var cropX = (cropArea.x / 100) * imgWidth;
			var cropY = (cropArea.y / 100) * imgHeight;
			var cropWidth = (cropArea.width / 100) * imgWidth;
			var cropHeight = (cropArea.height / 100) * imgHeight;

			// Set canvas dimensions to match the crop area at FULL RESOLUTION
			canvas.width = cropWidth;
			canvas.height = cropHeight;

			// Apply rotation if needed
			if (rotation !== 0) {
				ctx.save();
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate((rotation * Math.PI) / 180);
				ctx.drawImage(
					img,
					cropX,
					cropY,
					cropWidth,
					cropHeight,
					-cropWidth / 2,
					-cropHeight / 2,
					cropWidth,
					cropHeight
				);
				ctx.restore();
			} else {
				ctx.drawImage(
					img,
					cropX,
					cropY,
					cropWidth,
					cropHeight,
					0,
					0,
					cropWidth,
					cropHeight
				);
			}

			// Get the cropped image as data URL with maximum quality
			var croppedImageUrl = canvas.toDataURL("image/jpeg", 1.0);

			// Update the preview image
			previewImage.src = croppedImageUrl;

			// Create a new File object from the data URL
			fetch(croppedImageUrl)
				.then((res) => res.blob())
				.then((blob) => {
					selectedFiles[currentFileIndex] = new File(
						[blob],
						"cropped-image.jpg",
						{ type: "image/jpeg" }
					);

					// Update thumbnail
					var thumbnail = document.querySelector(
						`.thumbnail[data-index="${currentFileIndex}"] img`
					);
					if (thumbnail) {
						thumbnail.src = croppedImageUrl;
					}

					// Update original image dimensions
					originalImageDimensions[currentFileIndex] = {
						width: canvas.width,
						height: canvas.height,
					};
				})
				.catch((err) => {
					console.error("Error creating file from cropped image:", err);
					showErrorMessage("Error creating cropped image: " + err.message);
				});

			// Return to editor
			cropperArea.classList.add("media-upload__hidden");
			imageEditorArea.classList.remove("media-upload__hidden");

			// Reset rotation for the preview
			rotation = 0;
			applyFilter();

			// Update canvas size for drawing
			updateCanvasSize();
		};

		// Use the original image for cropping to maintain quality
		img.src = cropperImage.src;
	}

	// Reset to original image
	function resetToOriginal() {
		// Get the original image for the current file
		var originalImage = originalImages[currentFileIndex];
		if (originalImage) {
			// Set the cropper image to the original
			cropperImage.src = originalImage;
			cropperImage.style.transform = `rotate(0deg)`;
			rotation = 0;

			// Reset crop area to default
			var imgWidth = cropperImage.naturalWidth;
			var imgHeight = cropperImage.naturalHeight;

			// Calculate a default crop area (centered, 80% of the smaller dimension)
			var cropSize = Math.min(
				80,
				(Math.min(imgWidth, imgHeight) / Math.max(imgWidth, imgHeight)) * 80
			);

			if (imgWidth > imgHeight) {
				// Landscape image - center the crop horizontally
				var leftOffset = (100 - cropSize) / 2;
				cropArea = { x: leftOffset, y: 10, width: cropSize, height: cropSize };
			} else {
				// Portrait or square image - center the crop vertically
				var topOffset = (100 - cropSize) / 2;
				cropArea = { x: 10, y: topOffset, width: cropSize, height: cropSize };
			}

			// Update the crop window
			updateCropWindow();
		}
	}

	// Video Attachment Handler
	function handleVideoAttachment(videoElement, options = {}) {
		// Default options
		var config = {
			allowTrim: true,
			allowVolumeControl: true,
			maxDuration: 60, // seconds
			showControls: true,
			autoPlay: false,
			...options,
		};

		// State variables
		var videoSrc = null;
		let videoFile = null;
		let startTime = 0;
		let endTime = 0;
		let volume = 1;
		let isMuted = false;
		let isPlaying = false;
		let videoDuration = 0;

		// Create UI elements for video controls
		var createVideoControls = (videoContainer) => {
			var controlsContainer = document.createElement("div");
			controlsContainer.className = "video-controls";

			// Play/Pause button
			var playButton = document.createElement("button");
			playButton.className = "video-control-btn play-btn";
			playButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      `;
			playButton.addEventListener("click", togglePlay);

			// Volume button
			var volumeButton = document.createElement("button");
			volumeButton.className = "video-control-btn volume-btn";
			volumeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      `;
			volumeButton.addEventListener("click", toggleMute);

			// Volume slider
			var volumeSlider = document.createElement("input");
			volumeSlider.type = "range";
			volumeSlider.min = 0;
			volumeSlider.max = 1;
			volumeSlider.step = 0.1;
			volumeSlider.value = volume;
			volumeSlider.className = "volume-slider";
			volumeSlider.addEventListener("input", (e) => {
				setVolume(Number.parseFloat(e.target.value));
			});

			// Progress bar
			var progressContainer = document.createElement("div");
			progressContainer.className = "video-progress-container";

			var progressBar = document.createElement("div");
			progressBar.className = "video-progress-bar";

			var progressFill = document.createElement("div");
			progressFill.className = "video-progress-fill";

			// Trim controls (if enabled)
			if (config.allowTrim) {
				var startTrimHandle = document.createElement("div");
				startTrimHandle.className = "trim-handle trim-handle-start";
				startTrimHandle.addEventListener("mousedown", (e) =>
					startDraggingTrimHandle(e, "start")
				);

				var endTrimHandle = document.createElement("div");
				endTrimHandle.className = "trim-handle trim-handle-end";
				endTrimHandle.addEventListener("mousedown", (e) =>
					startDraggingTrimHandle(e, "end")
				);

				var trimRegion = document.createElement("div");
				trimRegion.className = "trim-region";

				progressBar.appendChild(startTrimHandle);
				progressBar.appendChild(trimRegion);
				progressBar.appendChild(endTrimHandle);
			}

			progressBar.appendChild(progressFill);
			progressContainer.appendChild(progressBar);

			// Time display
			var timeDisplay = document.createElement("div");
			timeDisplay.className = "time-display";
			timeDisplay.textContent = "0:00 / 0:00";

			// Add all elements to controls container
			controlsContainer.appendChild(playButton);
			if (config.allowVolumeControl) {
				controlsContainer.appendChild(volumeButton);
				controlsContainer.appendChild(volumeSlider);
			}
			controlsContainer.appendChild(progressContainer);
			controlsContainer.appendChild(timeDisplay);

			videoContainer.appendChild(controlsContainer);

			return {
				controlsContainer,
				playButton,
				volumeButton,
				volumeSlider,
				progressBar,
				progressFill,
				timeDisplay,
			};
		};

		// Initialize video player
		var initVideoPlayer = (videoElement, videoSrc, file) => {
			// Store video file
			videoFile = file;

			// Set video source
			videoElement.src = videoSrc;

			// Set video attributes
			videoElement.controls = false;
			videoElement.autoplay = config.autoPlay;
			videoElement.volume = volume;

			// Create container for video and controls
			var videoContainer = document.createElement("div");
			videoContainer.className = "video-attachment-container";

			// Check if videoElement has a parent before removing
			if (videoElement.parentElement) {
				// Insert video into container
				var parentElement = videoElement.parentElement;
				parentElement.removeChild(videoElement);
				videoContainer.appendChild(videoElement);
				parentElement.appendChild(videoContainer);
			} else {
				// If no parent, just append to container and add container to body
				videoContainer.appendChild(videoElement);
				document.body.appendChild(videoContainer);
			}

			// Create custom controls
			var controls = createVideoControls(videoContainer);

			// Event listeners for video
			videoElement.addEventListener("loadedmetadata", () => {
				videoDuration = videoElement.duration;
				endTime = videoElement.duration;
				updateTimeDisplay(controls.timeDisplay);

				// Position trim handles
				if (config.allowTrim) {
					var startHandle = videoContainer.querySelector(".trim-handle-start");
					var endHandle = videoContainer.querySelector(".trim-handle-end");
					var trimRegion = videoContainer.querySelector(".trim-region");

					if (startHandle && endHandle && trimRegion) {
						startHandle.style.left = "0%";
						endHandle.style.left = "100%";
						trimRegion.style.left = "0%";
						trimRegion.style.width = "100%";
					}
				}
			});

			videoElement.addEventListener("timeupdate", () => {
				var currentTime = videoElement.currentTime;
				var progress = (currentTime / videoDuration) * 100;
				controls.progressFill.style.width = `${progress}%`;
				updateTimeDisplay(controls.timeDisplay);

				// If current time exceeds trim end time, seek back to start time
				if (config.allowTrim && currentTime >= endTime) {
					videoElement.currentTime = startTime;
					if (!isPlaying) {
						videoElement.pause();
					}
				}
			});

			videoElement.addEventListener("play", () => {
				isPlaying = true;
				controls.playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        `;
			});

			videoElement.addEventListener("pause", () => {
				isPlaying = false;
				controls.playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        `;
			});

			// Click on progress bar to seek
			controls.progressBar.addEventListener("click", (e) => {
				var rect = controls.progressBar.getBoundingClientRect();
				var pos = (e.clientX - rect.left) / rect.width;
				videoElement.currentTime = pos * videoDuration;
			});

			// Play video for 1 second then pause (preview)
			if (typeof autplayVideoForOneSec === "function") {
				autplayVideoForOneSec("#videoPreview");
			} else {
				// Fallback if the function doesn't exist
				videoElement.play();
				setTimeout(() => {
					videoElement.pause();
				}, 1000);
			}

			return {
				videoContainer,
				controls,
			};
		};

		// Toggle play/pause
		var togglePlay = () => {
			if (videoElement.paused) {
				videoElement.play();
			} else {
				videoElement.pause();
			}
		};

		// Toggle mute
		var toggleMute = () => {
			isMuted = !isMuted;
			videoElement.muted = isMuted;

			var volumeButton = document.querySelector(".volume-btn");
			if (volumeButton) {
				if (isMuted) {
					volumeButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          `;
				} else {
					volumeButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          `;
				}
			}
		};

		// Set volume
		var setVolume = (value) => {
			volume = value;
			videoElement.volume = volume;

			// Update mute state based on volume
			if (volume === 0) {
				isMuted = true;
				videoElement.muted = true;
			} else if (isMuted) {
				isMuted = false;
				videoElement.muted = false;
			}
		};

		// Format time (seconds to MM:SS)
		var formatTime = (seconds) => {
			var minutes = Math.floor(seconds / 60);
			var secs = Math.floor(seconds % 60);
			return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
		};

		// Update time display
		var updateTimeDisplay = (timeDisplay) => {
			if (!timeDisplay) return;
			var currentTime = videoElement.currentTime;
			timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(
				videoDuration
			)}`;
		};

		// Trim video handlers
		let isDraggingTrim = false;
		let activeTrimHandle = null;

		var startDraggingTrimHandle = (e, handle) => {
			e.preventDefault();
			isDraggingTrim = true;
			activeTrimHandle = handle;

			document.addEventListener("mousemove", handleTrimDrag);
			document.addEventListener("mouseup", stopDraggingTrim);
		};

		var handleTrimDrag = (e) => {
			if (!isDraggingTrim) return;

			var progressBar = document.querySelector(".video-progress-bar");
			if (!progressBar) return;

			var rect = progressBar.getBoundingClientRect();
			var pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

			var startHandle = document.querySelector(".trim-handle-start");
			var endHandle = document.querySelector(".trim-handle-end");
			var trimRegion = document.querySelector(".trim-region");

			if (!startHandle || !endHandle || !trimRegion) return;

			if (activeTrimHandle === "start") {
				var endPos = Number.parseFloat(endHandle.style.left) / 100;
				if (pos < endPos) {
					startTime = pos * videoDuration;
					startHandle.style.left = `${pos * 100}%`;
					trimRegion.style.left = `${pos * 100}%`;
					trimRegion.style.width = `${(endPos - pos) * 100}%`;

					// Seek to start time
					videoElement.currentTime = startTime;
				}
			} else if (activeTrimHandle === "end") {
				var startPos = Number.parseFloat(startHandle.style.left) / 100;
				if (pos > startPos) {
					endTime = pos * videoDuration;
					endHandle.style.left = `${pos * 100}%`;
					trimRegion.style.width = `${(pos - startPos) * 100}%`;
				}
			}
		};

		var stopDraggingTrim = () => {
			isDraggingTrim = false;
			document.removeEventListener("mousemove", handleTrimDrag);
			document.removeEventListener("mouseup", stopDraggingTrim);
		};

		// Upload video to S3 using existing API
		var uploadVideoToS3 = async (
			uploadType = "chatMedia",
			captionText = ""
		) => {
			if (!videoFile) {
				throw new Error("No video selected");
			}

			// Create FormData for upload
			var uploadData = new FormData();

			// Create a new filename with timestamp to avoid conflicts
			var timestamp = Date.now();
			var fileExtension = videoFile.name.split(".").pop();
			var newFileName = `video-${timestamp}.${fileExtension}`;

			// Create a new File object with the new name
			var videoFileToUpload = new File([videoFile], newFileName, {
				type: videoFile.type,
			});

			// Append the file to FormData with the key "uploaded_files"
			uploadData.append("uploaded_files", videoFileToUpload);

			// If this is for chat media, add the required metadata
			if (uploadType === "chatMedia") {
				var timestamp = Number(new Date().getTime() / 1000).toFixed(0);
				var userProfile = getProfileData();

				// Append the user id to the form data
				uploadData.append(
					"data",
					JSON.stringify({
						userId: userProfile.userId,
						chatId: jQuery(".chat__header").data("chatId") || "demo-chat-id",
						timeStamp: timestamp,
						// Add trim information if needed
						videoTrim: config.allowTrim
							? {
									startTime: startTime,
									endTime: endTime,
							  }
							: null,
					})
				);

				// Call the existing jsUpload function
				return jsUpload("uploadChatMedia", uploadData, {
					caption: captionText,
					onError: function (error) {
						showErrorMessage("Video upload failed: " + error.message);
					},
				});
			} else {
				// For other upload types
				return jsUpload("uploadMedia", uploadData, {
					caption: captionText,
					mediaType: "video",
					onError: function (error) {
						showErrorMessage("Video upload failed: " + error.message);
					},
				});
			}
		};

		// Public API
		return {
			initVideoPlayer,
			togglePlay,
			toggleMute,
			setVolume,
			uploadVideoToS3,

			// Getters
			getStartTime: () => startTime,
			getEndTime: () => endTime,
			getVolume: () => volume,
			isMuted: () => isMuted,
			isPlaying: () => isPlaying,
		};
	}

	// Add CSS styles for the improved UI
	const styleElement = document.createElement("style");
	styleElement.textContent = `
    /* Loading indicator */
    .preview__image.loading {
      opacity: 0.7;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 0.7; }
      50% { opacity: 0.5; }
      100% { opacity: 0.7; }
    }
    
    /* Error message container */
    .error-message-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 300px;
    }
    
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .error-icon {
      color: #721c24;
      flex-shrink: 0;
    }
    
    .error-message p {
      margin: 0;
      flex-grow: 1;
    }
    
    /* Aspect ratio selector */
    .aspect-ratio-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 20px;
    }
    
    .aspect-ratio-selector select {
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: white;
    }
    
    .cropper__ratio-indicator {
      text-align: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: #666;
    }
    
    /* Improved cropper */
    .cropper__window {
      border: 2px solid white;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    }
    
    .cropper__handle {
      width: 12px;
      height: 12px;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    }
  `;
	document.head.appendChild(styleElement);
}

// Optional: Define a function to handle data from the new tab
function handleDataFromNewTab(data) {
	console.log("Data received from new tab:", data);
	jQuery(".group-photo").attr("src", returnImagePath(data.images.Key));
	jQuery(".group-photo").data("groupImageData", data);
	// Update the DOM or perform actions based on the received data
}

// Show media in the preview area
function showMediaPopup(mediaLink, type) {
	if (jQuery("#whatsapp-media-viewer").length === 0) {
		// Create the media viewer HTML structure
		var designHtml = `<!-- Media Viewer (initially hidden) -->
      <div id="whatsapp-media-viewer" class="media-viewer">
        <div class="media-viewer-header">
          <div class="header-left">
            <button class="close-btn" onclick="closeMediaViewer()">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div class="sender-info">
              <div class="sender-name hidden">You</div>
              <div class="timestamp hidden">Today, 12:30 PM</div>
            </div>
          </div>
          <div class="header-right hidden">
            <button class="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </div>
        
        <div class="media-viewer-content">
          <div id="media-container"></div>
        </div>
        
        <div class="media-viewer-footer hidden">
          <div class="footer-actions">
            <button class="footer-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              <span>Reply</span>
            </button>
            <button class="footer-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/></svg>
              <span>Forward</span>
            </button>
            <button class="footer-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>`;

		// Add the design HTML to the body
		jQuery("body").append(designHtml);

		// Initialize the media viewer
		initMediaViewer();
	}

	// Open the media viewer with the provided media link and type
	openMediaViewer(mediaLink, type);
}

// WhatsApp Media Viewer Functions
function initMediaViewer() {
	// Add event listeners for keyboard navigation
	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			closeMediaViewer();
		}
	});

	// Close viewer when clicking on the background (but not on the media)
	var mediaViewerContent = document.querySelector(".media-viewer-content");
	if (mediaViewerContent) {
		mediaViewerContent.addEventListener("click", function (event) {
			if (event.target === this) {
				closeMediaViewer();
			}
		});
	}
}

// Open the media viewer with the provided media URL and type
function openMediaViewer(mediaUrl, mediaType) {
	var viewer = document.getElementById("whatsapp-media-viewer");
	var mediaContainer = document.getElementById("media-container");

	if (viewer && mediaContainer) {
		// Clear previous media
		mediaContainer.innerHTML = "";

		// Create the appropriate element based on media type
		if (mediaType === "video") {
			var videoElement = document.createElement("video");
			videoElement.id = "fullscreen-media";
			videoElement.src = mediaUrl;
			videoElement.controls = true;
			videoElement.autoplay = true;
			videoElement.className = "media-element";
			mediaContainer.appendChild(videoElement);
		} else {
			// Default to image
			var imgElement = document.createElement("img");
			imgElement.id = "fullscreen-media";
			imgElement.src = mediaUrl;
			imgElement.alt = "Full screen media";
			imgElement.className = "media-element";

			// Add zoom functionality only for images
			imgElement.addEventListener("click", function (event) {
				event.stopPropagation();
				this.classList.toggle("zoomed");
			});

			mediaContainer.appendChild(imgElement);
		}

		// Show the viewer
		viewer.classList.add("active");

		// Prevent scrolling on the body
		document.body.style.overflow = "hidden";

		// Update timestamp to current time
		updateTimestamp();
	}
}

// Close the media viewer
function closeMediaViewer() {
	var viewer = document.getElementById("whatsapp-media-viewer");

	if (viewer) {
		// Hide the viewer
		viewer.classList.remove("active");

		// Allow scrolling on the body again
		document.body.style.overflow = "auto";

		// Clear the media container after a short delay (for smooth transition)
		setTimeout(function () {
			var mediaContainer = document.getElementById("media-container");
			if (mediaContainer) {
				mediaContainer.innerHTML = "";
			}
		}, 300);
	}
}

// Update the timestamp to show current time
function updateTimestamp() {
	var timestampElement = document.querySelector(".timestamp");
	if (timestampElement) {
		var now = new Date();
		var hours = now.getHours();
		var minutes = now.getMinutes().toString().padStart(2, "0");
		var ampm = hours >= 12 ? "PM" : "AM";
		var formattedHours = hours % 12 || 12;

		var today = new Date();
		var yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		let datePrefix = "Today";

		timestampElement.textContent = `${datePrefix}, ${formattedHours}:${minutes} ${ampm}`;
	}
}
