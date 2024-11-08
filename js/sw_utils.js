/* SW_alert */
window.addEventListener('load',function()
{
/*	$(document).on('click','.sw_alert>button',function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		SW_hide_simple_modal();
	});
	*/
});

function sw_alert(msg,callback)
{
	console.log( 'sw_alert',msg );
	SW_show_simple_modal
	({
		onclose	: callback
		,html	:	'<div class="sw_alert">'
					+	'<p>'+text2html( msg )+'</p>'
					+	'<button class="btn">OK</button>'
					+'</div>'
	});
}

/*
sw_start_geolocation
({
	onUpdate:function(p)
	{

	}
	,onError:	function(e)
	{

	}
	,options:
	{

	}
});
*/

var _sw_sim_gps = []; //Simulation Support

function sw_start_geolocation(obj)
{
	if( ! navigator.geolocation )
	{
		console.error('Browser has no geolocation support');
		return;
	}

	if( typeof obj.onUpdate != 'function' )
		return;

	sw_stop_geolocation();

	var options	= obj.options ||
	{
		enableHighAccuracy  : true
		,maximumAge		: 30000
		,timeout		 : 27000
	};

	var e		 = (typeof obj.onError == 'function' ? obj.onError : function(a){ console.error( a ); });

	if( ! obj.simulate )
	{
		SW_position_id = navigator.geolocation.watchPosition
		(
			obj.onUpdate
			,e
			,options
		);
		return;
	}

	//simulacion
	SW_position_id = true;

	var i	 = { lat: 0, lon: 1, altitude: 2, speed: 3, timestamp: 4 };
	var now	= Date.now();
	var time0   = obj.simulateData[0][i.timestamp];
	var diff	= now - time0;
	var calls   = 0;

	var f = function( d ,t, delay )
	{
		var x = function()
		{
			calls++;
			console.log('XXXX');

			if( SW_position_id  === false )
				return;

			obj.onUpdate
			({
				timestamp   : t
				,coords	:
				{
					latitude			: d[ i.lat ]
					,longitude		: d[ i.lon ]
					,accuracy		 : null
					,altitudeAccuracy   : null
					,heading			: null
					,speed			: d[ i.speed ]
				}
			});
		};
		_sw_sim_gps.push( x );
		setTimeout( x, delay );
	};

	for(var j=0,ii=obj.simulateData.length;j<ii;j++)
	{
		var c	 = obj.simulateData[ j ][ i.timestamp ]
		var delay   = c - time0;
		var t	 = diff+c;
		f( obj.simulateData[ j ], c, delay );
	}
}

var SW_position_id = false;

function sw_stop_geolocation()
{
	if(SW_position_id !== true &&  SW_position_id )
		navigator.geolocation.clearWatch( SW_position_id );

	SW_position_id = false;

	if( _sw_sim_gps.length > 0 )
	{
		for(var i=0,j=_sw_sim_gps.length;i<j;i++)
		{
			clearTimeout( _sw_sim_gps[ i ] );
		}
		_sw_sim_gps = [];
	}
}


function text2html( h )
{
	var s = document.createElement('span');
	s.textContent = h;
   return s.innerHTML.replace(/\n/g,'<br>');
}
/* Regresa el nombre de una variable normalizada
	no ese una funcion avanzada solo hace lo siguiente
	una_variable_x => 'unaVariableX'
	toCamelCase
*/
function sw_normalize( name )
{
	var x = name.toLowerCase().split('_');
	var s = '';

	for(var i=0;i<x.length;i++)
	{
		s+= x[i].charAt(0).toUpperCase() + x[i].slice(1);
	}

	return s;
}

function is_numeric(input)
{
	var RE = /^-{0,1}\d*\.{0,1}\d+$/;
	return (RE.test(input));
}

function youtube_parser(url)
{
	var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match  = url.match(regExp);

	if (match&&match[2].length==11)
	{
		return match[2];
	}
	return false;
}


function isMobile()
{
	try
	{
		document.createEvent("TouchEvent");
		return true;
	}
	catch(e)
	{

	}
	return false;
}

function toFixed(value, precision)
{
	var precision   = precision || 0;
	var neg		= value < 0;
	var power	 = Math.pow(10, precision);
	var value	 = Math.round(value * power);
	var integral	= String((neg ? Math.ceil : Math.floor)(value / power));
	var fraction	= String((neg ? -value : value) % power);
	var padding	= new Array(Math.max(precision - fraction.length, 0) + 1).join('0');

	return precision ? integral + '.' +  padding + fraction : integral;
}



function getTimestampString( date )
{
	var d = date || new Date();
	var minutes = d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes();
	var hours   = d.getHours() < 10 ? '0'+d.getHours(): d.getHours();
	var seconds = d.getSeconds() < 10 ? '0'+d.getSeconds() : d.getSeconds();
	var months  = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1);
	var days	= d.getDate() < 10 ? '0'+d.getDate(): d.getDate();

	return d.getFullYear()+'-'+months+'-'+days+' '+hours+':'+minutes+':'+seconds;
}

function timestamp2Date(t)
{
	var a		= t.split(/[- :]/);
	var last	= a[5] || 0;

	return new Date
	(
		a[0],
		a[1]-1,
		a[2],
		a[3],
		a[4],
		last
	);
}


function getHumanDate( mysql_date, timeDiff )
{
	var d = timestamp2Date( mysql_date );

	d.setTime( d.getTime() + timeDiff );

	var ampm = d.getHours() < 12 ? 'am':'pm';
	var hour = d.getHours() % 12;
	if( hour == 0 )
		hour = 12;

	var minutes  = ''+d.getMinutes();

	if( minutes.length == 1 )
	 minutes = '0'+minutes;

	return months[ d.getMonth() ] +' '+d.getDate()+', '+d.getFullYear();
}

function getHumanReadableDate( mysql_date,timeDiff )
{
	var d = timestamp2Date( mysql_date );

	d.setTime( d.getTime() + timeDiff );

	var ampm = d.getHours() < 12 ? 'am':'pm';
	var hour = d.getHours() % 12;
	if( hour == 0 )
		hour = 12;

	var minutes  = ''+d.getMinutes();
	if( minutes.length == 1 )
	 minutes = '0'+minutes;

	return  d.getDate()+' '+months[ d.getMonth()] +' '+d.getFullYear();
}

function sw_pagination( obj )
{
	/*
		$container.html
		(
			advancedPagination
			({
				totalRows : 20
				,rowPerPage: 10
				,currentPage: 2
				,link_format: '<a href="#" data-page="PAGE_NUMBER">PAGE_TITLE</a>'
				,current_page_format: '<b> PAGE_NUMBER </b>'
				,nextTitle: 'Siguiente'
				,prevTitle: '<<'
			})
		);
	*/
	//totalRows, rowsPerPage,currentPage,link_format,current_page_format = "<b> PAGE_NUMBER </b>")

	var nav	= '';
	var prev	= '';
	var next	= '';

	var pageNum = parseInt( obj.currentPage, 10);
	var maxPage = Math.ceil( parseInt( obj.totalRows, 10 )/ obj.rowsPerPage );
	var offset  = ( pageNum - 1) * parseInt( obj.rowsPerPage , 10) ;
	var search  = ['PAGE_NUMBER','PAGE_TITLE'];

	var start   = 0;
	var end	= 5;

	if( pageNum > 5 )
	{
		start = pageNum - 5;

		if(pageNum < maxPage)
		{
			nextPages = maxPage - pageNum;
			end	 = nextPages > 5 ? pageNum+5 : pageNum+nextPages;
		}
		else
			end = maxPage;
	}
	else
	{
		start = 0;
		end   = maxPage<10 ? maxPage : 11;
	}

	for(var page=start; page <end; page++)
	{
		//replace = array(page,page);
		format  = page == pageNum ? obj.current_page_format : obj.link_format;
		nav	+= format.split( 'PAGE_NUMBER' ).join( page ).split( 'PAGE_TITLE' ).join( (page+1) );
		//str_replace( search, replace , format );
	}
	if (pageNum > 0)
	{
		page = (pageNum - 1);
		prev = obj.link_format.split( 'PAGE_NUMBER').join( page ).split( 'PAGE_TITLE' ).join( obj.prevTitle );
		//str_replace( search ,array(page,"Previous"), link_format );
	}
	else
	{
		// we're on page one, don't print previous link
		prev = obj.disable_prev_format.split( 'PAGE_TITLE' ).join( obj.prevTitle );
	}

	if (pageNum < maxPage-1)
	{
		page = (pageNum + 1);
		next = obj.link_format.split( 'PAGE_NUMBER').join( page ).split( 'PAGE_TITLE' ).join( obj.nextTitle );
		//str_replace(search,array(page,"Next"),link_format);
	}
	else
	{
		//next = ''; // we're on the last page, don't print next link
		next = obj.disable_next_format.split( 'PAGE_TITLE' ).join( obj.nextTitle );
	}

	if(maxPage != 1)
		return prev + nav + next;
}

/*
 * getURLVimeoVideoCapture(url): Permite obtener una captura de un video en vimeo, dado una url.
 */

function getURLYoutubeVideoCapture( obj )
{
	var url	= $.url( obj.url );
	var videoId = url.param( 'v' );
	obj.callback( 'http://img.youtube.com/vi/'+videoId+'/mqdefault.jpg' );
}

/*
 * getURLVimeoVideoCapture(url): Permite obtener una captura de un video en vimeo, dado una url.
 */
function getURLVimeoVideoCapture(url)
{
	var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;

	if( typeof parseUrl[5] != 'undefined' )
		return parseUrl[5]


	//var video_id = getVimeoVideoID($url);

	//var hash = unserialize(file_get_contents("http://vimeo.com/api/v2/video/"+video_id+".php"));
	//	return $hash[0]["thumbnail_large"];
	return false;
}

function validateTypes( fields )
{
	for(var i in fields )
	{
		var value = $(i).val();
		var msg   = fields[i].msg;

		if( !fields[i].empty && value && value.trim() == '' )
		{
			if( msg.toLowerCase().indexOf('el' ) == 0 )
				sw_alert( fields[i].msg +' no puede estar vacio');
			else
				sw_alert( fields[i].msg +' no puede estar vacia');
			$( i ).focus();
			return false;
		}
		switch( fields[i].type )
		{
			case 'string': break;
			case 'phone' :
			{
				var final_num= value.replace( /\D/g, '');
				if( final_num.length < 10 )
				{
					sw_alert( fields[i].msg+' debe contener al menos 10 digitos ');
					$(i).focus();
					return false;
				}
				break;
			}
			case 'number' :
			{
				if( ! /\d\+/.test( value.trim() ))
				{
					sw_alert( fields[i ].msg+' no es un número valido');
					$( i ).focus();
					return false;
				}
				break;
			}
			case 'email':
			{
				if( value && value.trim().length < 6 )
				{
					sw_alert( fields[i].msg+' no es válido');
					$( i ).focus();
					return false;
				}
				if( value && value.indexOf('@') == -1 )
				{
					sw_alert( fields[i].msg+' no es válido');
					$( i ).focus();
					return false;
				}
				break;
			}
			case 'especific':
			{
				return;
			}
		}
	}
	return true;
}

function tame_image_upload( container,callback , has_limits)
{
	var form_data  = { user_session_id: getSessionId() };

	if( has_limits )
		form_data.no_limits = '1';

	$(container).append('<div class="fileupload_indicator"></div>');
	$(container+'>input[type="file"]').attr('name','image_file');
	$(container+'>input[type="file"]').fileupload
	({
		url			: tame_domain+'/v1/api/addImage.php'
		,dataType	 : 'json'
		,formData	 : form_data
		,done		 : function(e, data)
		{
			if( data.result.result )
			{
				if( typeof callback == 'function')
				{
					callback(tame_domain+'/v1/php/getImage.php?name='+data.result.data.name);
				}

				$( container ).attr('style','background-image:url("'+tame_domain+'/v1/php/getImage.php?name='+data.result.data.name+'"); background-size: cover;');
				$(container+'>input[type="hidden"]').val( data.result.data.id );
				$(container+'>.fileupload_indicator').css ( 'width', '0%');
			}
			else
			{
				$(container+'>.fileupload_indicator').css ( 'width', '0%');
				sw_alert('Ocurrio un error al subir la imagen\nPor favor intenta de nuevo');
			}
		}
		,progressall	: function (e, data)
		{
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$(container+'>.fileupload_indicator').css ( 'width', progress + '%');
		}
		,fail		 : function(){ sw_alert('Ocurrio un error al subir la imagen\nPor favor intenta de nuevo'); }
	});
}

function getInvertShadow(hexcolor, alfa)
{
	var a = alfa || '1';
	var r = hexToRgb( getInvertColor( hexcolor) );
	var z = Math.floor( (r.r + r.g + r.b)/3 );

	return 'rgba('+z+','+z+','+z+','+a+')';
}

function getInvertColor(hexcolor)
{
	var r = hexToRgb( hexcolor );

	var new_r = (new Number(255-r.r)).toString( 16 );
	var new_g = (new Number( 255-r.g )).toString( 16 );
	var new_b = (new Number( 255-r.b )).toString( 16 );
	return '#'+(new_r.length < 2 ? '0'+new_r: new_r )
		+(new_g.length < 2 ? '0'+new_g: new_g )
		+(new_b.length < 2 ? '0'+new_b: new_b );
}

function hexToRgb(hex)
{
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : { r: 0 , g: 0, b:0 };
}

function SW_evt_handler()
{
	this.funList = {'ALL':[]};
	this.results = {};
}

/*
	name is a string regex example  SW_ready.add("/^index.html/"); //All string that start with index.html
	can be also a string
		SW_ready.add("index.html"); //all string that contains index.html
*/
SW_evt_handler.prototype.add = function(name,func)
{
	if( typeof name == 'function')
	{
		this.funList['ALL'].push( name );
	}
	else
	{
		if( typeof name == 'string' && typeof func == 'function' )
		{
			if( typeof this.funList[ name ] == 'undefined' )
			{
				this.funList[ name ] = [ func ];
			}
			else
			{
				this.funList[ name ].push( func );
			}
		}
	}
};

SW_evt_handler.prototype.runAll  = function( name )
{

	var regexp  = null
	var to_run  = this.funList['ALL'];

	for (var i in this.funList)
	{
		var regParts = i.match(/^\/(.*?)\/([gim]*)$/);

		if (regParts)
		{
			regexp = new RegExp(regParts[1], regParts[2]);
		}
		else
		{
			regexp = new RegExp(i);
		}


		if( regexp.test( name ) )
		{
			to_run = this.funList[ i ];

			for (var i=0; i< to_run.length; i++)
				to_run[ i ].call(this, this.results );  // you can pass in a "this" parameter here.
		}
	}
};

SW_evt_handler.prototype.default_ready = function()
{
	window.addEventListener('load', function()
	{
		console.log('Ready is ',window.location);

		if( window.location.pathname == '/' ||
			window.location.pathname == '/index.php'
			)
			SW_ready.runAll( '/index.html' );
		else
			SW_ready.runAll( window.location.pathname );
	});
};

SW_ready = new SW_evt_handler();

function sw_insert_css( css_rules )
{
	var style		 = document.createElement('style');
	style.type		= 'text/css';
	style.innerHTML	= css_rules;
	document.getElementsByTagName('head')[0].appendChild(style);
}

function SW_insertCssFile( css_file_addres )
{
	var link	= document.createElement( 'link' );
	link.href   = css_file_addres;
	link.type   = 'text/css';
	link.rel	= 'stylesheet';
	//link.media  = 'screen,print';
	document.getElementsByTagName( 'head' )[0].appendChild( link );
}

function insertScript( script_address )
{
	$('<script src="'+script_address+'">\x3c/script>').appendTo('head');
}

function sw_all( selector )
{
	return document.querySelectorAll( selector );
}

function sw_first( selector )
{
	return document.querySelector( selector );
}

function sw_id( id )
{
	return document.getElementById( id )
}

/**
	sw_body_click('a[href="logout.html"]'),function( evt )
	{
		console.log( evt )
	});

*/
function sw_body_click(selector,callback)
{
	sw_body_delegate('click' ,selector ,callback);
/*	window.addEventListener('click',function(evt)
	{
		var e = evt || window.event;
		var targ = e.target || e.srcElement;

		if( targ.nodeType == 3 )
			targ = targ.parentNode;

		if( targ.matches( selector ) )
		{
			callback( evt );
		}
	})
*/
}
var SW_BODY_EVENTS = {};
function sw_event_handler(evt)
{
	var funcs = SW_BODY_EVENTS[ evt.type ];

	if( ! funcs )
	{
		sw_alert('NO funcs');
		return;
	}

	var e		= evt || window.event;
	var targ	= e.target || e.srcElement;


	var body = document.body;

	for(var cur = targ; cur != body; cur=cur.parentNode )
	{
		for(var selector in funcs )
		{
			if( targ.matches( selector ) )
			{
				//sw_alert('Calling '+selector);
				funcs[selector].call( targ , evt );
				return;
			}
		}
	}
}

function sw_body_delegate( evt_type, selector ,callback )
{
	var funcs	= SW_BODY_EVENTS[ evt_type ];
	if( funcs )
	{
		funcs[ selector ] = callback;
	}
	else
	{
		document.body.addEventListener( evt_type, sw_event_handler, false );
		funcs						= {};
		funcs[ selector ]			= callback;
		SW_BODY_EVENTS[ evt_type ]	= funcs;
	}
}

function inIframe ()
{
	try
	{
		return window.self !== window.top;
	}
	catch (e)
	{
		return true;
	}
}

String.prototype.hashCode = function()
{
  return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}


function SW_delete_cache()
{
	var cacheStatusValues = [];
	cacheStatusValues[0] = 'uncached';
	cacheStatusValues[1] = 'idle';
	cacheStatusValues[2] = 'checking';
	cacheStatusValues[3] = 'downloading';
	cacheStatusValues[4] = 'updateready';
	cacheStatusValues[5] = 'obsolete';

	var logEvent = function(e)
	{
		var online, status, type, message;
		online = (navigator.onLine) ? 'yes' : 'no';
		status = cacheStatusValues[cache.status];
		type = e.type;
		message = 'online: ' + online;
		message+= ', event: ' + type;
		message+= ', status: ' + status;
		if (type == 'error' && navigator.onLine)
		{
			message+= ' (prolly a syntax error in manifest)';

		}
		console.log(message);
	};

	var cache = window.applicationCache;
	cache.addEventListener('cached', logEvent, false);
	cache.addEventListener('checking', logEvent, false);
	cache.addEventListener('downloading', logEvent, false);
	cache.addEventListener('error', logEvent, false);
	cache.addEventListener('noupdate', logEvent, false);
	cache.addEventListener('obsolete', logEvent, false);
	cache.addEventListener('progress', logEvent, false);
	cache.addEventListener('updateready', logEvent, false);

	window.applicationCache.addEventListener
	(
		'updateready',
		function()
		{
			window.applicationCache.swapCache();
			console.log('swap cache has been called');
		},
		false
	);
	setInterval(function(){cache.update()}, 10000);
}

SW_ready.add('ALL',function()
{
	//var values = document.querySelectorAll('[data-toggle-visibility]');
	//for( var i= 0;
});



/*
	var schema=
	{
		db			: 'gpsSessions'
		,v			: 1
		,stores		:
		[
			'runs' :
			{

			}
			,'bike': {}
		]
	};
	SW_db
	({
		schema:{stores:['runs','titles']}
		,callback : function( db )
		{
			db.store.add({ id:Date.now(), name:'hola'});
			db.title.remove
			({
				id			:13
				,success	:function(){
			}})
		}
	});
*/
function SW_db(obj)
{
	var DBOpenRequest	 = window.indexedDB.open( obj.schema.name || 'sw_db', obj.schema.version || 1 );
	DBOpenRequest.onerror   = obj.onError || function(){ console.error('Ocurrio un error no se pudo inicializar la bd')};
	var db				= null;

	DBOpenRequest.onupgradeneeded	= function(event)
	{
		console.log('Creando los stores');
		var db = event.target.result;

		for(var i in obj.schema.stores )
		{
			console.log('Creando store'+i);
			var store = db.createObjectStore( i ,{ keyPath:'id' , autoincrement: false} );
		}
	};

	DBOpenRequest.onsuccess = function(e)
	{
		console.log('IR A BORRAR');
		console.log('Se abrio correctamente la bd');
		db		= DBOpenRequest.result;
		var result  = {};
		console.log( 'Que tiene stores',obj.schema.stores );

		for(var i in obj.schema.stores )
		{
			console.log('Creando objeto db '+i);
			result[ i ] = new SW_db_store(i,db);
		}
		obj.callback( result );
	};

	function deleteAllStores(db)
	{
		console.log('Storenames '+db.objectStoreNames );
		for(var i in db.objectStoreNames )
		{
			console.log( 'Borrando store '+i+' '+db.objectStoreNames[ i ] );
		 objectStore = db.deleteObjectStore( db.objectStoreNames[i] );
		}
	}

	var SW_db_store = function( name,IDBDatabase)
	{
		this.db	= IDBDatabase;
		this.name	= name;
	};
	/*
		obj.add
		({
			items	: [ {id:'algo',name:'xxx'}]
			,success:function(){}
			,error	:function(){}
		});
	*/
	SW_db_store.prototype.add = function( s )
	{
		var t			= this.db.transaction( [this.name], 'readwrite' );
		t.oncomplete	= s.success || function(){};
		t.onerror		= s.error	|| function(){};
		var storage		= t.objectStore( this.name );
		for( var i in s.items )
		{
			console.log('GUardando ',s.items[i] );
			if( s.items[i].id )
			{
				storage.add( s.items[i] );
			}
			else
			{
				storage.add( s.items[i], Date.now() );
			}
		}
	};

	/*
		obj.clear
		({
			success:function(){}
			,error	:function(){}
		});
	*/
	SW_db_store.prototype.clear= function( s )
	{
		var t			= this.db.transaction( [this.name], 'readwrite' );
		t.oncomplete	= s.success || function(){};
		t.onerror		= s.error	|| function(){};

		var storage= t.objectStorage( this.name );
		storage.clear();
	};
	/*
		obj.clear
		({
			success:function(){}
			,error	:function(){}
		});
	*/
	SW_db_store.prototype.remove = function( s )
	{
		var t			= this.db.transaction( [this.name], 'readwrite' );
		t.oncomplete	= s.success || function(){};
		t.onerror		= s.error	|| function(){};

		var storage= t.objectStorage( this.name );
		storage.remove( s.id || Date.now() );
	};
	/*
		obj.update
		({
			item	:{id:'xxx',other_property:'fff',... }
			success:function(){}
			,error	:function(){}
		});
	*/
	SW_db_store.prototype.update = function( s )
	{
		if( s && s.error && !s.item  )
		{
			s.error();
			return;
		}

		var t		 = this.db.transaction( [this.name], 'readwrite' );
		t.oncomplete	= s.success || function(){};
		t.onerror	 = s.error	|| function(){};

		var storage= t.objectStorage( this.name );
		storage.put( s.item );
	};
	SW_db_store.prototype.put = SW_db_store.prototype.update;
	/*
		https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange

		obj.cursor
		({
			range	: IDBKeyRange.bound("A", "F", fase,false)
			success:function()
			{

			}
			,error	:function(){}
			,'mode'	: 'readwrite','read'
			,'direction: 'next || 'nextunique' || 'prev' || 'prevuniqe'
		});
	*/
	SW_db_store.prototype.cursor = function( s )
	{
		var t		 = this.db.transaction( [this.name], s.mode || 'readwrite' );
		t.oncomplete	= s.success || function(){};
		t.onerror	 = s.error	|| function(){};

		var storage	= t.transaction.objectStore( this.name );
		storage.openCursor( keyRangeValue, s.direction || 'next' ).onsuccess = s.success;
	};
}
/*
	SW_show_simple_modal
	({
		html	: '<img src="/images/loader.gif" alt="please wait"><br><h2>Processing your order</h2>'
		delay	: 1000
		onclose	: function()
		{
			console.log('Modal is close now');
		}
	});
*/
function SW_show_simple_modal(obj)
{
	SW_hide_simple_modal();
	var sa			= document.getElementById('SW_simple_modal_content');
	var sa_parent	= null;
	if( sa )
	{
		sw_id('SW_simple_modal_content').innerHTML = obj.html;
	}
	else
	{
		var sa_parent = document.createElement('div');
		sa_parent.setAttribute('id','SW_simple_modal');
		sa_parent.innerHTML = '<div id="SW_simple_modal_content">'+obj.html+'</div>';
		document.body.appendChild( sa_parent );
		document.body.classList.add('stop-scrolling');
	}

	if( !sa_parent )
		sa_parent = sa.parentElement;

	sa_parent.style.display	= '';

	if( typeof obj.onclose == "function" )
	{
		sa_parent.sw_onclose	= obj.onclose;
	}

	if( obj.delay )
	{
		setTimeout( SW_hide_simple_modal, obj.delay );
	}
}
/**
*/
function SW_hide_simple_modal()
{
	var modal	= sw_id('SW_simple_modal');

	if( modal )
	{
		modal.style.display = 'none';
		document.body.classList.remove('stop-scrolling');
		if( modal.sw_onclose  )
			modal.sw_onclose();

		modal.sw_onclose = null;
	}
}

function SW_show_full_alert(obj)
{
	SW_hide_full_alert();
	var sa			= document.getElementById('SW_full_alert_content');
	var sa_parent	= null;

	if( sa )
	{
		sw_id('SW_full_alert_title').innerHTML   = '<h1>'+obj.title+'</h1>';
		sw_id('SW_full_alert_content').innerHTML = obj.html;
	}
	else
	{
		var sa_parent = document.createElement('div');
		sa_parent.setAttribute('id','SW_full_alert');
		sa_parent.innerHTML =
			'<div id="SW_full_alert_container">'
			+	'<div id="SW_full_alert_title">'
			+		'<h1>'+obj.title+'</h1>'
			+	'</div>'
			+	'<div id="SW_full_alert_content">'+obj.html +'</div>'
			+	'<div class="OK">'
			+		'<button id="SW_FULL_MODAL_OK" class="btn">OK</button>'
			+	'</div>'
			+'</div>';
		document.body.appendChild( sa_parent );
		document.body.classList.add('stop-scrolling');
		sw_id('SW_FULL_MODAL_OK').addEventListener('click',function(e)
		{
			e.stopPropagation();
			SW_hide_full_alert();
		});
	}

	if( !sa_parent )
		sa_parent = sa.parentElement.parentElement;

	sa_parent.style.display	= '';

	if( typeof obj.onclose == "function" )
	{
		sa_parent.sw_onclose	= obj.onclose;
	}

	if( obj.delay )
	{
		setTimeout( SW_hide_full_alert, obj.delay );
	}
}
/**
*/
function SW_hide_full_alert()
{
	var alert	= sw_id('SW_full_alert');

	if( alert )
	{
		alert.style.display = 'none';
		document.body.classList.remove('stop-scrolling');
		if( alert.sw_onclose  )
			alert.sw_onclose();

		alert.sw_onclose = null;
	}
}

