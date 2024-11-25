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

// Example call to render the first page of 'PadRatnakar.pdf'
document.addEventListener('DOMContentLoaded', () => {
    renderPDFAsImage('books_pdf/PadRatnakar.pdf', 'pdf-image');
});
function openPdf(pdfUrl) {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    pdfFrame.src = pdfUrl;
    pdfViewer.style.display = 'block';
}

function closePdf() {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    pdfFrame.src = ''; // Clear the PDF
    pdfViewer.style.display = 'none';
}
function openPdfInViewer(pdfUrl) {
    const viewerUrl = `https://docs.google.com/gview?url=${window.location.origin}/${pdfUrl}&embedded=true`;
    window.open(viewerUrl, '_blank');
}

const scale = 1.5;
let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const canvas = document.querySelector('#pdf-render');
const ctx = canvas.getContext('2d');

function renderPage(num) {
  pageIsRendering = true;

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = { canvasContext: ctx, viewport };
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;
      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    document.querySelector('#page-num').textContent = num;
  });
}

function queueRenderPage(num) {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
}

function showPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function showNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function openPdfViewer(pdfPath) {
  const modal = document.querySelector('#pdf-viewer-modal');
  modal.style.display = 'flex';

  pdfjsLib
    .getDocument(pdfPath)
    .promise.then((pdfDoc_) => {
      pdfDoc = pdfDoc_;
      document.querySelector('#page-count').textContent = pdfDoc.numPages;
      renderPage(pageNum);
    })
    .catch((err) => {
      alert('Error loading PDF: ' + err.message);
    });
}

function closePdfViewer() {
  document.querySelector('#pdf-viewer-modal').style.display = 'none';
}

document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
