// Function to render the first page of a PDF as an image
function renderPDFAsImage(pdfUrl, imageId) {
    // Get the image element by ID
    const imageElement = document.getElementById(imageId);

    // Load the PDF using PDF.js
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        // Get the first page
        pdf.getPage(1).then(page => {
            // Create a canvas to render the page
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Define the scale (zoom level) of the rendering
            const scale = 1.5; 
            const viewport = page.getViewport({ scale: scale });

            // Set the canvas size to match the page's size
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render the page into the canvas
            page.render({
                canvasContext: context,
                viewport: viewport
            }).promise.then(() => {
                // Convert the canvas to a data URL and set it as the image source
                imageElement.src = canvas.toDataURL();
            });
        });
    }).catch(error => {
        console.error('Error loading the PDF: ', error);
    });
}
let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    currentPDF = ''; // Dynamic PDF URL

const scale =0.5, // Adjust scale to control zoom level
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
