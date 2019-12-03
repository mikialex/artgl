import { Controller } from "./controller";
import { Interactor } from "./interactor";
import { SceneNode } from "../scene-node";
import { Vector3, MathUtil } from "@artgl/math";
import { Spherical } from "@artgl/math/src/spherical";

const targetPosition = new Vector3();

export class FirstPersonController extends Controller {
  constructor(object: SceneNode) {
    super();
    this.object = object
  }

  reloadStates() {}

  object: SceneNode;

  movementSpeed = 1.0;
  lookSpeed = 0.005;

  lookVertical = true;
  autoForward = false;

  activeLook = true;

  heightSpeed = false;
  heightCoef = 1.0;
  heightMin = 0.0;
  heightMax = 1.0;

  constrainVertical = false;
  verticalMin = 0;
  verticalMax = Math.PI;

  mouseDragOn = false;

  private autoSpeedFactor = 0.0;

  private mouseX = 0;
  private mouseY = 0;

  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private moveUp = false;
  private moveDown = false;

  private viewHalfX = 0;
  private viewHalfY = 0;

  private lat = 0;
  private lon = 0;

  private lookDirection = new Vector3();
  private spherical = new Spherical();
  private target = new Vector3();

  onKeyDown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 38: /*up*/
      case 87: /*W*/ this.moveForward = true; break;

      case 37: /*left*/
      case 65: /*A*/ this.moveLeft = true; break;

      case 40: /*down*/
      case 83: /*S*/ this.moveBackward = true; break;

      case 39: /*right*/
      case 68: /*D*/ this.moveRight = true; break;

      case 82: /*R*/ this.moveUp = true; break;
      case 70: /*F*/ this.moveDown = true; break;

    }
  }

  onKeyUp(event: KeyboardEvent) {
    switch (event.keyCode) {

      case 38: /*up*/
      case 87: /*W*/ this.moveForward = false; break;

      case 37: /*left*/
      case 65: /*A*/ this.moveLeft = false; break;

      case 40: /*down*/
      case 83: /*S*/ this.moveBackward = false; break;

      case 39: /*right*/
      case 68: /*D*/ this.moveRight = false; break;

      case 82: /*R*/ this.moveUp = false; break;
      case 70: /*F*/ this.moveDown = false; break;

    }
  }
  update() { }

  // update() {
  //   const delta = 1;

  //   if (this.heightSpeed) {
  //     var y = MathUtil.clamp(this.object.transform.position.y, this.heightMin, this.heightMax);
  //     var heightDelta = y - this.heightMin;
  //     this.autoSpeedFactor = delta * (heightDelta * this.heightCoef);
  //   } else {
  //     this.autoSpeedFactor = 0.0;
  //   }

  //   const actualMoveSpeed = delta * this.movementSpeed;

  //   if (this.moveForward || (this.autoForward && !this.moveBackward)) {
  //     this.object.translateZ(- (actualMoveSpeed + this.autoSpeedFactor));
  //   }
  //   if (this.moveBackward) this.object.translateZ(actualMoveSpeed);

  //   if (this.moveLeft) this.object.translateX(- actualMoveSpeed);
  //   if (this.moveRight) this.object.translateX(actualMoveSpeed);

  //   if (this.moveUp) this.object.translateY(actualMoveSpeed);
  //   if (this.moveDown) this.object.translateY(- actualMoveSpeed);

  //   var actualLookSpeed = delta * this.lookSpeed;

  //   if (!this.activeLook) {
  //     actualLookSpeed = 0;
  //   }

  //   var verticalLookRatio = 1;

  //   if (this.constrainVertical) {
  //     verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
  //   }

  //   this.lon -= this.mouseX * actualLookSpeed;
  //   if (this.lookVertical) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

  //   this.lat = Math.max(- 85, Math.min(85, this.lat));

  //   var phi = MathUtil.degToRad(90 - this.lat);
  //   var theta = MathUtil.degToRad(this.lon);

  //   if (this.constrainVertical) {
  //     phi = MathUtil.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
  //   }

  //   var position = this.object.transform.position;

  //   targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

  //   this.object.transform.lookAt(targetPosition);

  // };



  registerInteractor(interactor: Interactor) {
    if (this.interactor !== null) {
      this.interactor.unbindControllerAllListener(this);
    }
    this.interactor = interactor;

    // this.interactor.bindLeftMouseMove(this, this.rotate);
    // this.interactor.bindRightMouseMove(this, this.move);
    // this.interactor.bindMouseWheel(this, this.zoom);
  }

}

// THREE.FirstPersonControls = function ( object, domElement ) {


// 	if ( this.domElement !== document ) {

// 		this.domElement.setAttribute( 'tabindex', - 1 );

// 	}

// 	//

// 	this.handleResize = function () {

// 		if ( this.domElement === document ) {

// 			this.viewHalfX = window.innerWidth / 2;
// 			this.viewHalfY = window.innerHeight / 2;

// 		} else {

// 			this.viewHalfX = this.domElement.offsetWidth / 2;
// 			this.viewHalfY = this.domElement.offsetHeight / 2;

// 		}

// 	};

// 	this.onMouseDown = function ( event ) {

// 		if ( this.domElement !== document ) {

// 			this.domElement.focus();

// 		}

// 		event.preventDefault();
// 		event.stopPropagation();

// 		if ( this.activeLook ) {

// 			switch ( event.button ) {

// 				case 0: this.moveForward = true; break;
// 				case 2: this.moveBackward = true; break;

// 			}

// 		}

// 		this.mouseDragOn = true;

// 	};

// 	this.onMouseUp = function ( event ) {

// 		event.preventDefault();
// 		event.stopPropagation();

// 		if ( this.activeLook ) {

// 			switch ( event.button ) {

// 				case 0: this.moveForward = false; break;
// 				case 2: this.moveBackward = false; break;

// 			}

// 		}

// 		this.mouseDragOn = false;

// 	};

// 	this.onMouseMove = function ( event ) {

// 		if ( this.domElement === document ) {

// 			this.mouseX = event.pageX - this.viewHalfX;
// 			this.mouseY = event.pageY - this.viewHalfY;

// 		} else {

// 			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
// 			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

// 		}

// 	};

// 	this.lookAt = function ( x, y, z ) {

// 		if ( x.isVector3 ) {

// 			target.copy( x );

// 		} else {

// 			target.set( x, y, z );

// 		}

// 		this.object.lookAt( target );

// 		setOrientation( this );

// 		return this;

// 	};


// 	function contextmenu( event ) {

// 		event.preventDefault();

// 	}

// 	this.dispose = function () {

// 		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
// 		this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
// 		this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
// 		this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );

// 		window.removeEventListener( 'keydown', _onKeyDown, false );
// 		window.removeEventListener( 'keyup', _onKeyUp, false );

// 	};

// 	var _onMouseMove = bind( this, this.onMouseMove );
// 	var _onMouseDown = bind( this, this.onMouseDown );
// 	var _onMouseUp = bind( this, this.onMouseUp );
// 	var _onKeyDown = bind( this, this.onKeyDown );
// 	var _onKeyUp = bind( this, this.onKeyUp );

// 	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
// 	this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
// 	this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
// 	this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

// 	window.addEventListener( 'keydown', _onKeyDown, false );
// 	window.addEventListener( 'keyup', _onKeyUp, false );

// 	function bind( scope, fn ) {

// 		return function () {

// 			fn.apply( scope, arguments );

// 		};

// 	}

// 	function setOrientation( controls ) {

// 		var quaternion = controls.object.quaternion;

// 		lookDirection.set( 0, 0, - 1 ).applyQuaternion( quaternion );
// 		spherical.setFromVector3( lookDirection );

// 		lat = 90 - THREE.Math.radToDeg( spherical.phi );
// 		lon = THREE.Math.radToDeg( spherical.theta );

// 	}

// 	this.handleResize();

// 	setOrientation( this );

// };
