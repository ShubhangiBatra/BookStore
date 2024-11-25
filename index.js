
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    currentPDF = ''; // Dynamic PDF URL

const scale =0.2, // Adjust scale to control zoom level
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d'),
    loadingIndicator = document.querySelector('#loading'),
    modal = document.querySelector('#pdf-modal'),
    closeBtn = document.querySelector('#close-pdf-viewer');

// Render the page
const renderPage = (num) => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport,
        };

        // Show loading indicator
        loadingIndicator.style.display = 'block';

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            // Hide loading indicator
            loadingIndicator.style.display = 'none';

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

// Load PDF
const loadPDF = (pdfUrl) => {
    pdfjsLib.getDocument(pdfUrl).promise
        .then((pdfDoc_) => {
            pdfDoc = pdfDoc_;
            document.querySelector('#page-count').textContent = pdfDoc.numPages;
            renderPage(pageNum);
        })
        .catch((err) => {
            loadingIndicator.textContent = 'Error loading PDF.';
        });
};

// Open modal
document.querySelectorAll('.open-pdf-viewer').forEach((button) => {
    button.addEventListener('click', (e) => {
        currentPDF = e.target.getAttribute('data-pdf'); // Get PDF URL from data attribute
        pageNum = 1; // Reset to page 1
        modal.style.display = 'flex';
        loadPDF(currentPDF);
    });
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Navigation buttons
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
