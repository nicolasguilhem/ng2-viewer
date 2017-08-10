import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { FormatReader } from "app/format-reader";

@Component({
  selector: 'ng2-viewer',
  templateUrl: 'ng2-viewer.component.html',
  styleUrls: [ 'ng2-viewer.component.css' ]
})
export class Ng2ViewerComponent implements OnInit, OnChanges, DoCheck {
  
  firstChange = true;

  formatReader = new FormatReader();

  @Input('src')
  imageSource;

  @Input()
  overlays: Array<any>;

  @Input()
  title: string;

  @Input()
  options;

  @ViewChild('canvasEl')
  canvasEl: ElementRef;
  
  canMove: boolean;
  ctx: any;
  resize: any;
  curPos = { x : 0, y : 0};
  picPos = { x : 0, y : 0};
  mousePos = { x : 0, y : 0};
  reader = null;
  numPagePrev;

  constructor() {
  }

  ngOnInit() {

    this.canMove = false;

    this.ctx = this.canvasEl.nativeElement.getContext('2d');

    var canvasSize = this.canvasEl.nativeElement.parentNode;
    this.ctx.canvas.width  = canvasSize.clientWidth;
    this.ctx.canvas.height = canvasSize.clientHeight;
    this.resize = { height : canvasSize.clientHeight, width : canvasSize.clientWidth};			

    if (!this.options || this.options == undefined) {
      this.options =  {};
    }

    if (!this.options.ctx || this.options.ctx == undefined) {
      this.options.ctx = null;
    }

    if (!this.options.adsrc || this.options.adsrc == undefined) {
      this.options.adsrc = null;
    }

    if (!this.options.zoom || this.options.zoom == undefined) {
      this.options.zoom = {};
    }
    
    if (!this.options.zoom.value || this.options.zoom.value == undefined) {
      this.options.zoom.value = 1.0;
    }
    
    if (!this.options.zoom.step || this.options.zoom.step == undefined) {
      this.options.zoom.step = 0.1;
    }
    
    if (!this.options.zoom.min || this.options.zoom.min == undefined) {
      this.options.zoom.min = 0.05;
    }
    
    if (!this.options.zoom.max || this.options.zoom.max == undefined) {
      this.options.zoom.max = 6;
    }
    
    if (!this.options.rotate || this.options.rotate == undefined) {
      this.options.rotate = {};
    }
    
    if (!this.options.rotate.value || this.options.rotate.value == undefined) {
      this.options.rotate.value = 0;
    }
    
    if (!this.options.rotate.step || this.options.rotate.step == undefined) {
      this.options.rotate.step = 90;
    }

    if (!this.options.controls || this.options.controls == undefined) {
      this.options.controls = {};
    }
    
    if (!this.options.controls.toolbar || this.options.controls.toolbar == undefined) {
      this.options.controls.toolbar = true;
    }
    
    if (!this.options.controls.image || this.options.controls.image == undefined) {
      this.options.controls.image = true;
    }
    
    if (!this.options.controls.sound || this.options.controls.sound == undefined) {
      this.options.controls.soud = false;
    }
    
    if (!this.options.controls.fit || this.options.controls.fit == undefined) {
      this.options.controls.fit = 'page';
    }
    
    if (!this.options.controls.disableZoom || this.options.controls.disableZoom == undefined) {
      this.options.controls.disableZoom = false;
    }
    
    if (!this.options.controls.disableMove || this.options.controls.disableMove == undefined) {
      this.options.controls.disableMove = false;
    }
    
    if (!this.options.controls.disableRotate || this.options.controls.disableRotate == undefined) {
      this.options.controls.disableRotate = false;
    }
    
    if (!this.options.controls.numPage || this.options.controls.numPage == undefined) {
      this.options.controls.numPage = 1;
    }

    if (!this.options.controls.totalPage || this.options.controls.totalPage == undefined) {
      this.options.controls.totalPage = 1;
    }

    if (!this.options.controls.filmStrip || this.options.controls.filmStrip == undefined) {
      this.options.controls.filmStrip = false;
    }
    
    if (!this.options.info || this.options.info == undefined) {
      this.options.info = {};
    }
    
    this.options.ctx = this.ctx;

    this.numPagePrev = this.options.controls.numPage;

    this.load();
  }

  load() {
    
      if (this.imageSource === undefined || this.imageSource === null) {
        return;
      }

      // initialize values on load
      this.options.zoom.value = 1.0;
      this.options.rotate.value = 0;
      this.curPos = { x : 0, y : 0};
      this.picPos = { x : 0, y : 0};

      // test if object or string is input of directive
      if (typeof(this.imageSource) === 'object') {
        // Object type file
        if (this.formatReader.IsSupported(this.imageSource.type)) {
          // get object
          var decoder = this.formatReader.CreateReader(this.imageSource.type, this.imageSource);
          // Create image
          this.reader = decoder.create(this.imageSource, this.options, () => this.onload(), this.ctx);
        } else {
          console.log(this.imageSource.type,' not supported !');
        }
      } else if(typeof(this.imageSource) === 'string') {
        this.reader = this.formatReader.CreateReader('image/jpeg', null).create(this.imageSource, this.options, () => this.onload());
      }

  }

  onload() {
    if (this.reader == null) {
      return;
    }

    if (this.reader.rendered) {
      this.applyTransform();
    } else {
      this.resizeTo(this.options.controls.fit);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes.imageSource && !changes.imageSource.firstChange) {
      this.load();
    }
  }

  ngDoCheck(): void {
    
    if (this.numPagePrev != this.options.controls.numPage) {

      // Limit page navigation
      if (this.options.controls.numPage < 1) this.options.controls.numPage = 1;
      if (this.options.controls.numPage > this.options.controls.totalPage) this.options.controls.numPage = this.options.controls.totalPage;
      if (this.reader != null) {
        if (this.options.controls.filmStrip) {
          // All pages are already rendered so go to correct page
          this.picPos.y = (this.options.controls.numPage - 1)  * -(this.reader.height+15);
          this.applyTransform();
        } else {
          if (this.reader.refresh != null) {
            this.reader.refresh();
          }
        }
      }
      
      this.numPagePrev = this.options.controls.numPage;
    }
  }

  mouseup(event: MouseEvent) {
    if (this.options.controls.disableMove) {
      return;
    }

    this.canMove = false;
  }

  mousedown(event: MouseEvent) {
    if (this.options.controls.disableMove) {
      return;
    }

    this.canMove = true;
    this.curPos.x = event.offsetX;
    this.curPos.y = event.offsetY;
  }

  mousemove(event: MouseEvent) {
    this.mousePos.x = event.offsetX;
    this.mousePos.y = event.offsetY;
    if (this.options.controls.disableMove) {
      return;
    }

    if ((this.reader !== null) && (this.canMove)) {
        var coordX = event.offsetX;
        var coordY = event.offsetY;
        var translateX = coordX - this.curPos.x;
        var translateY = coordY - this.curPos.y;
        this.picPos.x += translateX;
        this.picPos.y += translateY;
        this.applyTransform();
        this.curPos.x = coordX;
        this.curPos.y = coordY;
    }
  }

  mouseleave(event: MouseEvent) {
    this.canMove=false;
  }

  mousewheel(event: WheelEvent) {
    // cross-browser wheel delta
    let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    if (this.options.controls.filmStrip) {
      this.picPos.y += 50 * delta;
      // Limit range
      if (this.picPos.y > 15) {
        this.picPos.y = 15;
      }
      if (this.reader.images) {
        if (this.picPos.y - this.reader.height * this.options.zoom.value < -(this.reader.height + 15) * this.reader.images.length  * this.options.zoom.value ) {
          this.picPos.y = -(this.reader.height + 15) * this.reader.images.length + this.reader.height;
        }
      } else {
        if (this.picPos.y - this.reader.height  * this.options.zoom.value < -this.reader.height * this.options.zoom.value ) {
          this.picPos.y = -this.reader.height * this.options.zoom.value;
        }
      }
      
      this.applyTransform();
      
    } else {

      if(delta > 0) {
        this.zoom(1);
      } else {
        this.zoom(-1);
      }
    }
    
    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if(event.preventDefault) {
        event.preventDefault();
    }
  }

  resizeTo (value) {
      if ((this.ctx.canvas == null) || (this.reader == null))  {
        return;
      }
      // Compute page ratio
      var options = this.options;
      var ratioH = this.ctx.canvas.height / this.reader.height;
      var ratioW = this.ctx.canvas.width / this.reader.width;
      // If reader render zoom itself
      // Precompute from its ratio
      if (!this.reader.isZoom) {
        ratioH *= this.options.zoom.value;				
        ratioW *= this.options.zoom.value;
      }
      // Adjust value
      switch(value) {
        case 'width' : this.options.zoom.value = ratioW; break;
        case 'height' : this.options.zoom.value = ratioH; break;
        case 'page' :
        default : this.options.zoom.value = Math.min(ratioH,ratioW); 
      }
      
      // Round zoom value
      this.options.zoom.value = Math.round(this.options.zoom.value*100)/100;
      // Update options state
      this.options.controls.fit = value;
      if (!this.reader.isZoom) {
        if (this.reader.refresh != null) {
          this.reader.refresh();
        }

        // Re center image
        this.centerPics();
      } else {
        // Re center image
        this.centerPics();
        this.applyTransform();
      }
    }

    centerPics() {
      // Position to canvas center
      var centerX = this.ctx.canvas.width / 2;
      var picPosX = 0;
      picPosX =  centerX - (this.reader.width * this.options.zoom.value) / 2;
      this.curPos = { x : picPosX, y : 0};
      this.picPos = { x : picPosX, y : 0};
    }

    applyTransform() {
      if (this.reader == null) {
        return;
      }
      if (!this.reader.rendered) {
        return;
      }
      let options = this.options;
      let canvas = this.ctx.canvas ;
      let centerX = this.reader.width * options.zoom.value/2;
      let centerY = this.reader.height * options.zoom.value/2;
      // Clean before draw
      this.ctx.clearRect(0,0,canvas.width, canvas.height);
      // Save context
      this.ctx.save();
      // move to mouse position
      this.ctx.translate((this.picPos.x + centerX), (this.picPos.y + centerY) );
      // Rotate canvas
      this.ctx.rotate( options.rotate.value * Math.PI/180);
      // Go back
      this.ctx.translate( - centerX, - centerY);
      // Change scale
      if (this.reader.isZoom)
        this.ctx.scale( options.zoom.value , options.zoom.value);
      if ((!options.controls.filmStrip) || (options.controls.totalPage == 1)) {
        if (this.reader.img != null) {
          this.ctx.drawImage(this.reader.img, 0 , 0 , this.reader.width , this.reader.height);
          this.ctx.beginPath();
          this.ctx.rect(0, 0, this.reader.width , this.reader.height );
          this.ctx.lineWidth = 0.2;
          this.ctx.strokeStyle = "#000000";
          this.ctx.stroke();
        }
        // Draw image at correct position with correct scale
        if (this.reader.data != null) {
          this.ctx.putImageData(this.reader.data, this.picPos.x, this.picPos.y);					
          this.ctx.beginPath();
          this.ctx.rect( 0, 0, this.reader.width , this.reader.height );
          this.ctx.lineWidth = 0.2;
          this.ctx.strokeStyle = "#000000";
          this.ctx.stroke();
        } 
      } else {
        if (this.reader.images != null) {

          this.reader.images.forEach(image => {
            this.ctx.drawImage(image, 0 , 0 , image.width , image.height);
            this.ctx.beginPath();
            this.ctx.rect(0, 0, image.width , image.height );
            this.ctx.lineWidth = 0.2;
            this.ctx.strokeStyle = "#000000";
            this.ctx.stroke();
            this.ctx.translate(0, image.height + 15);
          });
        }
        // Draw image at correct position with correct scale
        if (this.reader.data != null) {
          var offsetY = 0;
          this.reader.data.forEach(data => {
            this.ctx.putImageData(data, this.picPos.x, this.picPos.y + offsetY);					
            this.ctx.beginPath();
            this.ctx.rect( 0, 0, this.reader.width , this.reader.height );
            this.ctx.lineWidth = 0.2;
            this.ctx.strokeStyle = "#000000";
            this.ctx.stroke();
            offsetY += this.reader.height + 15;
            this.ctx.translate(0, offsetY);
          });
        } 
      }
      // Restore
      this.ctx.restore();

      // Draw overlays
      if (this.overlays && this.overlays.length > 0) {
        this.overlays.forEach(item => {
          this.ctx.save();
          // move to mouse position
          this.ctx.translate((this.picPos.x + centerX) , (this.picPos.y + centerY));
          // Rotate canvas
          this.ctx.rotate( options.rotate.value * Math.PI/180);
          // Go back
          this.ctx.translate(- centerX, - centerY);
          // Change scale
          this.ctx.scale( options.zoom.value , options.zoom.value);
          // Start rect draw
          this.ctx.beginPath();
          this.ctx.rect((item.x ), (item.y ), item.w , item.h );
          this.ctx.fillStyle = item.color;
          this.ctx.globalAlpha = 0.4;
          this.ctx.fill();
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = item.color;
          this.ctx.stroke();
          this.ctx.restore();
        });
      }
    }
    
    zoom (direction) {
      var oldWidth, newWidth = 0;
      var oldHeight, newHeight = 0;
      // Does reader support zoom ?
      // Compute correct width
      if (!this.reader.isZoom) {
        oldWidth = this.reader.oldwidth;
        oldHeight = this.reader.height;
      } else {
        oldWidth = this.reader.width * this.options.zoom.value;
        oldHeight = this.reader.height * this.options.zoom.value;
      }

      // Compute new zoom
      this.options.zoom.value += this.options.zoom.step * direction;
      // Round
      this.options.zoom.value = Math.round(this.options.zoom.value*100)/100;
      if (this.options.zoom.value >= this.options.zoom.max) {
        this.options.zoom.value = this.options.zoom.max;
      }
      if (this.options.zoom.value <= this.options.zoom.min) {
        this.options.zoom.value = this.options.zoom.min;
      }
      // Refresh picture
      if (this.reader.refresh != null) {
        this.reader.refresh();
      }
      
      // Compute new image size
      if (!this.reader.isZoom) {
        newWidth = this.reader.width;
        newHeight = this.reader.height;
      } else {
        newWidth = this.reader.width * this.options.zoom.value;
        newHeight = this.reader.height * this.options.zoom.value;
      }
      // new image position after zoom
      this.picPos.x = this.picPos.x - (newWidth - oldWidth)/2;
      this.picPos.y = this.picPos.y - (newHeight - oldHeight)/2;

      this.applyTransform();
    }
      
    rotate (direction) {
      this.options.rotate.value += this.options.rotate.step * direction;
      if ((this.options.rotate.value <= -360) || (this.options.rotate.value >= 360)) {
        this.options.rotate.value = 0;
      }
      this.applyTransform();
    }

    play() {
      if (this.options.adsrc!=null) {
        this.options.adsrc.start(0);
      }
    }

    stop() {
      if (this.options.adsrc!=null) {
        this.options.adsrc.stop(0);
      }
    }
}
