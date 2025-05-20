// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const compressionControls = document.querySelector('.compression-controls');
const previewSection = document.querySelector('.preview-section');

// 当前处理的图片文件
let currentFile = null;
let compressedFile = null;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示文件信息
function displayFileInfo(file, element) {
    element.textContent = formatFileSize(file.size);
}

// 处理文件上传
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    displayFileInfo(file, originalSize);

    // 显示原始图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // 显示压缩控制区域
    compressionControls.style.display = 'block';
    previewSection.style.display = 'block';
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: qualitySlider.value / 100
    };

    try {
        compressedFile = await imageCompression(currentFile, options);
        displayFileInfo(compressedFile, compressedSize);

        // 显示压缩后的图片预览
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedPreview.src = e.target.result;
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedFile) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedFile);
    link.download = `compressed_${currentFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 事件监听器
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-color)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

compressBtn.addEventListener('click', compressImage);
downloadBtn.addEventListener('click', downloadCompressedImage); 