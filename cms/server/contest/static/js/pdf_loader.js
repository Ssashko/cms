class pdfReader {
    constructor(link, canvas, workerSrc, AllPagesCount, CurrentCounter) {

        this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1,
        this.canvas = canvas,
        this.ctx = canvas.getContext('2d');
        this.pdfDoc = null;
        this.allPagesCount = AllPagesCount;
        this.currentCounter = CurrentCounter;

        this.pdfjsLib.getDocument(link).promise.then(pdfDoc_ => {
            this.pdfDoc = pdfDoc_;
            this.allPagesCount.innerHTML = this.pdfDoc.numPages;
            
            this.renderPage(this.pageNum);

        });       
    }

    renderPage(num) {
        this.pageRendering = true;

        this.pdfDoc.getPage(num).then(page => {
          var viewport = page.getViewport({scale: this.scale});
          this.canvas.height = viewport.height;
          this.canvas.width = viewport.width;
      
          var renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
          };
          var renderTask = page.render(renderContext);
    
          renderTask.promise.then(() => {
            this.pageRendering = false;
            if (this.pageNumPending !== null) {

              this.renderPage(this.pageNumPending);
              this.pageNumPending = null;
            }
          });
        });
      
        this.currentCounter.textContent = num;
      }

      queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
      }

    onPrevPage() {
        if (this.pageNum <= 1) {
            return;
        }
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }
    
    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) {
            return;
        }
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }
    onScale(scale) {
        if(scale >= 0.5 && scale <= 5)
        {
            this.scale = scale;
            this.queueRenderPage(this.pageNum);
        }
    }
      
}
function pdfReaderInit(id) {
    let rootEl = document.getElementById(id);

    let readerPdf = new pdfReader(
        rootEl.dataset.pdflink,
        rootEl.querySelector('.pdf-control-main'),
        rootEl.dataset.workersrc,
        rootEl.querySelector('.pdf-control-all'),
        rootEl.querySelector('.pdf-control-current')
        );

    rootEl.querySelector('.pdf-control-prev').addEventListener('click', () => {
        readerPdf.onPrevPage();
    });
    rootEl.querySelector('.pdf-control-next').addEventListener('click', () => {
        readerPdf.onNextPage();
    });
    rootEl.querySelector('.pdf-control-scale').addEventListener('change', (el) => {
        readerPdf.onScale(el.target.value);
    });
}