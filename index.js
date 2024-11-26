let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    currentPDF = '', // Dynamic PDF URL
    scale = 1; // Default scale for PDFs

const canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d'),
    loadingIndicator = document.querySelector('#loading'),
    modal = document.querySelector('#pdf-modal'),
    closeBtn = document.querySelector('#close-pdf-viewer');

// Render the page
const renderPage = (num) => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale });
        const containerWidth = canvas.parentElement.offsetWidth; // Fit canvas to container
        const scaleFactor = containerWidth / viewport.width;

        // Adjust the viewport based on the new scale
        const adjustedViewport = page.getViewport({ scale: scaleFactor });
        canvas.height = adjustedViewport.height;
        canvas.width = adjustedViewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport: adjustedViewport,
        };

        // Show loading indicator
        loadingIndicator.style.display = 'block';

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;
            loadingIndicator.style.display = 'none'; // Hide loading indicator

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Update page number
        document.querySelector('#page-num').textContent = num;
    });
};

// Queue render page
const queueRenderPage = (num) => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show previous page
const showPrevPage = () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
};

// Show next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
};

// Zoom In
document.querySelector('#zoom-in').addEventListener('click', () => {
    scale += 0.2; // Increase scale
    queueRenderPage(pageNum);
});

// Zoom Out
document.querySelector('#zoom-out').addEventListener('click', () => {
   // Prevent overly zoomed-out views
        scale -= 0.2;
        queueRenderPage(pageNum);
    
});

// Load PDF
const loadPDF = (pdfUrl) => {
    loadingIndicator.textContent = 'Loading PDF...';
    loadingIndicator.style.display = 'block';

    pdfjsLib.getDocument(pdfUrl).promise
        .then((pdfDoc_) => {
            pdfDoc = pdfDoc_;
            document.querySelector('#page-count').textContent = pdfDoc.numPages;

            // Reset scale and page number
            scale = 1.0;
            pageNum = 1;

            loadingIndicator.style.display = 'none';
            renderPage(pageNum);
        })
        .catch((err) => {
            loadingIndicator.textContent = 'Error loading PDF.';
            console.error(err);
        });
};

// Open modal and load PDF
document.querySelectorAll('.open-pdf-viewer').forEach((button) => {
    button.addEventListener('click', (e) => {
        currentPDF = e.target.getAttribute('data-pdf'); // Get PDF URL from data attribute
        modal.style.display = 'flex'; // Show modal
        loadPDF(currentPDF);
    });
});

// Close modal and reset viewer
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    loadingIndicator.style.display = 'none'; // Hide loading indicator
});

// Navigation buttons
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');

    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
});
