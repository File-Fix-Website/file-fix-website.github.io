
// =========================
// IMAGE RESIZER
// =========================

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const browseBtn = document.getElementById("browseBtn");

const resizerWorkspace = document.getElementById("resizerWorkspace");
const imagePreview = document.getElementById("imagePreview");
const imageInfo = document.getElementById("imageInfo");

const imageWidth = document.getElementById("imageWidth");
const imageHeight = document.getElementById("imageHeight");
const lockRatio = document.getElementById("lockRatio");
const outputFormat = document.getElementById("outputFormat");
const qualitySection = document.getElementById("qualitySection");
const imageQuality = document.getElementById("imageQuality");
const qualityValue = document.getElementById("qualityValue");

const resizeBtn = document.getElementById("resizeBtn");
const removeImageBtn = document.getElementById("removeImageBtn");
const resetSizeBtn = document.getElementById("resetSizeBtn");
const swapDimensionsBtn = document.getElementById("swapDimensionsBtn");

const resizeResult = document.getElementById("resizeResult");
const resultDimensions = document.getElementById("resultDimensions");
const resultFileSize = document.getElementById("resultFileSize");
const downloadBtn = document.getElementById("downloadBtn");
// BEFORE / AFTER COMPARISON

const comparisonSection = document.getElementById("comparisonSection");
const comparisonContainer = document.getElementById("comparisonContainer");
const comparisonAfter = document.getElementById("comparisonAfter");
const comparisonOriginal = document.getElementById("comparisonOriginal");
const comparisonBefore = document.getElementById("comparisonBefore");
const comparisonDivider = document.getElementById("comparisonDivider");
const comparisonSlider = document.getElementById("comparisonSlider");

let originalImage = null;
let originalWidth = 0;
let originalHeight = 0;
let aspectRatio = 1;

let originalObjectUrl = null;
let resizedObjectUrl = null;

let resizedBlob = null;
let resizedFileName = "filefix-resized-image";

// IMAGE QUALITY

imageQuality.addEventListener("input", () => {
    qualityValue.textContent = `${imageQuality.value}%`;
});

// BEFORE / AFTER SLIDER

function updateComparison(value) {
    comparisonBefore.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    comparisonDivider.style.left = `${value}%`;
}

comparisonSlider.addEventListener("input", () => {
    updateComparison(comparisonSlider.value);
});

// Initial position
updateComparison(50);

// SHOW QUALITY ONLY FOR JPG AND WEBP

function updateQualityVisibility() {
    const supportsQuality =
        outputFormat.value === "image/jpeg" ||
        outputFormat.value === "image/webp";

    qualitySection.hidden = !supportsQuality;
}

outputFormat.addEventListener("change", updateQualityVisibility);

// Initial state
updateQualityVisibility();

// =========================
// FILE UPLOAD
// =========================

browseBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        loadImage(file);
    }
});

function loadImage(file) {

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Please upload a JPG, PNG or WEBP image.");
        imageInput.value = "";
        return;
    }

    if (file.size > 20 * 1024 * 1024) {
        alert("Maximum file size is 20 MB.");
        imageInput.value = "";
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    const testImage = new Image();

    testImage.onload = () => {

        if (testImage.naturalWidth > 12000 || testImage.naturalHeight > 12000) {
            URL.revokeObjectURL(objectUrl);
            alert("Maximum image dimensions are 12000 × 12000 pixels.");
            imageInput.value = "";
            return;
        }

        if (originalObjectUrl) {
            URL.revokeObjectURL(originalObjectUrl);
        }

        originalObjectUrl = objectUrl;

        originalImage = testImage;
        originalWidth = testImage.naturalWidth;
        originalHeight = testImage.naturalHeight;

        aspectRatio = originalWidth / originalHeight;

        imagePreview.src = originalObjectUrl;

        imageWidth.value = originalWidth;
        imageHeight.value = originalHeight;

        imageInfo.textContent =
            `Original size: ${originalWidth} × ${originalHeight} px`;

        uploadArea.hidden = true;
        resizerWorkspace.hidden = false;

        resizeResult.hidden = true;
        clearResizedImage();

    };

    testImage.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        alert("Could not load this image.");
        imageInput.value = "";
    };

    testImage.src = objectUrl;
}


// =========================
// DRAG AND DROP
// =========================

uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (event) => {

    event.preventDefault();
    uploadArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
        loadImage(file);
    }

});

// PRESET SIZES
const scaleButtons = document.querySelectorAll(".scale-button");
const presetButtons = document.querySelectorAll(".preset-button");

presetButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!originalImage) {
            alert("Please upload an image first.");
            return;
        }

        const width = Number(button.dataset.width);
        const height = Number(button.dataset.height);

        imageWidth.value = width;
        imageHeight.value = height;

        // Highlight selected preset
        presetButtons.forEach(item => {
            item.classList.remove("active");
        });

        scaleButtons.forEach(item => item.classList.remove("active"));

        button.classList.add("active");
    });
});

// SCALE IMAGE



scaleButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!originalImage) {
            alert("Please upload an image first.");
            return;
        }

        const scale = Number(button.dataset.scale) / 100;

        const width = Math.round(originalWidth * scale);
        const height = Math.round(originalHeight * scale);

        if (width > 12000 || height > 12000) {
            alert("Maximum dimensions are 12000 × 12000 pixels.");
            return;
        }

        imageWidth.value = width;
        imageHeight.value = height;

        // Clear selected presets
        presetButtons.forEach(item => {
            item.classList.remove("active");
        });

        // Highlight selected scale
        scaleButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});

// RESET SIZE

resetSizeBtn.addEventListener("click", () => {
    if (!originalImage) return;

    imageWidth.value = originalWidth;
    imageHeight.value = originalHeight;

    presetButtons.forEach(button => button.classList.remove("active"));
    scaleButtons.forEach(button => button.classList.remove("active"));
});

// SWAP DIMENSIONS

swapDimensionsBtn.addEventListener("click", () => {
    if (!originalImage) return;

    const currentWidth = imageWidth.value;
    const currentHeight = imageHeight.value;

    imageWidth.value = currentHeight;
    imageHeight.value = currentWidth;

    presetButtons.forEach(button => button.classList.remove("active"));
    scaleButtons.forEach(button => button.classList.remove("active"));
});

// =========================
// ASPECT RATIO
// =========================

imageWidth.addEventListener("input", () => {
    presetButtons.forEach(button => button.classList.remove("active"));
    scaleButtons.forEach(button => button.classList.remove("active"));

    if (!originalImage || !lockRatio.checked) return;

    const width = Number(imageWidth.value);

    if (width > 0) {
        imageHeight.value = Math.round(width / aspectRatio);
    }
});

imageHeight.addEventListener("input", () => {
    presetButtons.forEach(button => button.classList.remove("active"));
    scaleButtons.forEach(button => button.classList.remove("active"));

    if (!originalImage || !lockRatio.checked) return;

    const height = Number(imageHeight.value);

    if (height > 0) {
        imageWidth.value = Math.round(height * aspectRatio);
    }
});


// =========================
// RESIZE IMAGE
// =========================

resizeBtn.addEventListener("click", () => {

    if (!originalImage) return;

    const width = Number(imageWidth.value);
    const height = Number(imageHeight.value);

    if (
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width < 1 ||
        height < 1 ||
        width > 12000 ||
        height > 12000 ||
        width * height > 40000000
    ) {
        alert("Invalid dimensions. Maximum size is 12000 × 12000 pixels and 40 megapixels in total.");
        return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        alert("Your browser does not support image resizing.");
        return;
    }

    canvas.width = width;
    canvas.height = height;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(originalImage, 0, 0, width, height);

    const format = outputFormat.value;

    const mimeType = format;

    const quality = Number(imageQuality.value) / 100;

    canvas.toBlob((blob) => {

        if (!blob) {
            alert("Could not resize this image.");
            return;
        }

        clearResizedImage();

        resizedBlob = blob;
        resizedObjectUrl = URL.createObjectURL(blob);

        // UPDATE BEFORE / AFTER COMPARISON

        comparisonOriginal.src = originalObjectUrl;
        comparisonAfter.src = resizedObjectUrl;

        comparisonSlider.value = 50;
        updateComparison(50);

        comparisonSection.hidden = false;

        const extension = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/webp": "webp"
        }[mimeType];

        resizedFileName = `filefix-resized-image.${extension}`;

        resultDimensions.textContent = `${width} × ${height} px`;

        const fileSizeKB = blob.size / 1024;

        resultFileSize.textContent = fileSizeKB >= 1024
            ? `${(fileSizeKB / 1024).toFixed(2)} MB`
            : `${fileSizeKB.toFixed(1)} KB`;

        resizeResult.hidden = false;

    }, mimeType, mimeType === "image/png" ? undefined : quality);

});


// =========================
// DOWNLOAD
// =========================

downloadBtn.addEventListener("click", () => {

    if (!resizedBlob || !resizedObjectUrl) return;

    const link = document.createElement("a");

    link.href = resizedObjectUrl;
    link.download = resizedFileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

});


// =========================
// REMOVE IMAGE
// =========================

removeImageBtn.addEventListener("click", resetResizer);

function resetResizer() {

    if (originalObjectUrl) {
        URL.revokeObjectURL(originalObjectUrl);
        originalObjectUrl = null;
    }

    clearResizedImage();

    originalImage = null;

    originalWidth = 0;
    originalHeight = 0;
    aspectRatio = 1;

    imageInput.value = "";

    imagePreview.removeAttribute("src");

    imageWidth.value = "";
    imageHeight.value = "";

    imageInfo.textContent = "";

    resizeResult.hidden = true;

    resizerWorkspace.hidden = true;
    uploadArea.hidden = false;

}

function clearResizedImage() {

    if (resizedObjectUrl) {
        URL.revokeObjectURL(resizedObjectUrl);
        resizedObjectUrl = null;
    }

    resizedBlob = null;
}
