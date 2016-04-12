window.addEventListener('load',function(e)
{
	sw_id('textareajson').addEventListener('change',function(e)
	{
		var commonStructure= JSON.parse( sw_id('textareajson').value );
		var s = '<option value="">Select an option</option>';
		for( var i in commonStructure )
		{
			s+='<option value="'+text2html(i)+'">'+text2html(i)+'</option>';
		}
		sw_id('formId').innerHTML = s;
	});
	sw_id('generateForm').addEventListener('click',function(e)
	{
		generateForm();
	});

	sw_id('generateJSON').addEventListener('click',function(e)
	{
		var obj = getCommonStructureFromForm();
		sw_id('textareajson').value =  JSON.stringify( obj );
		sw_id('generateButtonContainer').style = '';
	});

	sw_id('textAreaGenerate').addEventListener('click',function(e)
	{
		e.preventDefault();
		var commonStructure= JSON.parse( sw_id('textareajson').value );
		var s = '';
		for( var table in commonStructure )
		{
			s+='<div>';
			s+=		'<h2>Table '+table+'</h2>';

			for(var field in commonStructure[ table ] )
			{
				var f = commonStructure[ table ][ field ];
				if( f.values == 'null' || f.values == null )
					f.values = '';
				s += getTypeSelect( table,field, f.flags, f.values)
			}
			s+='</div>';
		}
		sw_id('fieldsd').innerHTML = s;
		sw_id('generateButtonContainer').style = '';
	});

	sw_id('submitButton').addEventListener('click',function(e)
	{
		e.preventDefault();
		var data =
		{
			'host'		:sw_id('host').value
			,'user'		:sw_id('user').value
			,'password'	:sw_id('password').value
			,'database'	:sw_id('database').value
		};

		$.ajax
		({
			url			:'getSchema.php'
			,method		:'POST'
			,dataType	: 'JSON'
			,data		: data
			,success	:function(response)
			{

				//console.log( response );
				var commonStructure = toCommonStructure( response );

				var s = '';
				for( var table in commonStructure )
				{
					s+='<div>';
					s+=		'<h2>Table '+table+'</h2>';

					for(var field in commonStructure[ table ] )
					{
						var f = commonStructure[ table ][ field ];
						s += getTypeSelect( table,field, f.type, f.values)
					}
					s+='</div>';
				}
				sw_id('fieldsd').innerHTML = s;
				sw_id('generateButtonContainer').setAttribute('style','');
			}
		});
	});
});

function generateForm()
{
	var s = '';
	var formName = sw_id('formId').value;
	if( formName == '' )
	{
		alert('Select an option');
		return;
	}


	var tables	= JSON.parse( sw_id('textareajson').value );
	var table 	= tables[ formName ];

	for(var i in table )
	{

		var f		= table[ i ].flags;
		var values	= table[ i ].values;


		var required	= (f & flags.REQUIRED_ON_INSERT ) || (f && flags.REQUIRED_ON_UPDATE ) ? 'required':'';

		if( ( f & flags.IGNORE_ON_INSERT ) && ( f & flags.IGNORE_ON_UPDATE ) )
		{
			continue;
		}

		var type = getType( f )

		switch( type )
		{
			case 0							: continue;
			case flags.INT_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="number" name="'+i+'" '+required+'>\n'
				break;
			case flags.STRING_VALUE			:
				s	+=	'<label form="">'+i+'<label><input type="text" name="'+i+'" '+required+'>\n'
				break;
			case flags.EMAIL_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="email" name="'+i+'" '+required+'>\n'
				break;
			case flags.DOMAIN_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="text" name="'+i+'" '+required+'>\n'
				break;
			case flags.URL_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="url" name="'+i+'" '+required+'>\n'
				break;
			case flags.TIMESTAMP_VALUE		:
				s	+='<label for="">'+i+' Date</label><input type="date" '+required+'>\n'
					+'<label for="">'+i+' Time</label><input type="time" '+required+'>\n'
				break;
			case flags.PHONE_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="tel" name="'+i+'" '+required+'>\n'
				break;
			case flags.ENUM_VALUE			:
				s	+= 	'<select name=""'+required+'>'
					+		'<option value="">Please select a '+i+'</option>\n';
				for(var j=0;j<values.length;j++)
				{
					s	+=	'<option value="'+text2html(values[j])+'">'+text2html(values[j])+'</option>\n'
				}
				s	+= '</select>\n';
				break;
			case flags.FLOAT_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="number" name="'+i+'" '+required+'>\n'
			case flags.CREDIT_CARD_VALUE	:
				s	+=	'<label for="">'+i+'<label><input type="tel" name="'+i+'" '+required+'>\n'
			case flags.DIGITS_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="number" name="'+i+'" '+required+'>\n'
			case flags.TIME_VALUE			:
				s	+=	'<label for="">'+i+'<label><input type="time" name="'+i+'" '+required+'>\n'
		}
	}

	sw_id('fieldsd').innerHTML = text2html( s );
}

function getType( flag )
{

	if( (flag & flags.INT_VALUE )  != 0 )
		return flags.INT_VALUE;

	if( (flag & flags.STRING_VALUE)  != 0)
		return flags.STRING_VALUE;

	if( (flag & flags.EMAIL_VALUE) != 0)
		return flags.EMAIL_VALUE;

	if( (flag & flags.ENUM_VALUE)  != 0 )
		return flags.ENUM_VALUE;

	if( (flag & flags.PHONE_VALUE)  != 0 )
		return flags.PHONE_VALUE;

	if( (flag & flags.FLOAT_VALUE)  != 0 )
		return flags.FLOAT_VALUE;

	if( (flag & flags.TIMESTAMP_VALUE)  != 0 )
		return flags.TIMESTAMP_VALUE;

	if( (flag & flags.DIGITS_VALUE)  != 0 )
		return flags.DIGITS_VALUE;

	if( (flag & flags.CREDIT_CARD_VALUE ) != 0 )
		return flags.CREDIT_CARD_VALUE;

	if( (flag & flags.TIME_VALUE ) != 0)
		return flags.TIME_VALUE;
}

var flags =
{
	TRIM_ON_SAVE			: 1
	,INT_VALUE				: 2
	,STRING_VALUE			: 5
	,EMAIL_VALUE			: 9
	,DOMAIN_VALUE			: 17
	,URL_VALUE				: 33
	,TIMESTAMP_VALUE		: 64
	,PHONE_VALUE			: 129
	,ENUM_VALUE				: 256
	,FLOAT_VALUE			: 512
	,IGNORE_ON_INSERT		: 1024
	,IGNORE_ON_UPDATE		: 2048
	,REQUIRED_ON_INSERT		: 4096
	,REQUIRED_ON_UPDATE		: 8192
	,CREDIT_CARD_VALUE		: 16384
	,DIGITS_VALUE			: 32768
	,TIMESTAMP_ON_CREATE	: 65536
	,DONT_EXPORT_EXTERNAL	: 131072
	,TIME_VALUE				: 262144
	,INSERT_EMPTY_DEFAULT	: 524288
	//,DISCOUNTINUED			: 131072
	//,IS_SENSITIVE_DATA		: 131072
	,REQUIRED_ON_SAVE		: 6144
	//,IGNORE_ON_SAVE			: 3072
};

function getCommonStructureFromForm()
{
	var tables 	= {};
	var fields	= document.querySelectorAll('[data-table][data-field]');

	for(var i=0; i<fields.length;i++)
	{
		var tableName	= fields[i].getAttribute('data-table');
		var fieldName	= fields[i].getAttribute('data-field');

		if(!( tableName in tables ) )
			tables[ tableName ] = {};

		if(!( fieldName in tables[tableName] ) )
			tables[ tableName ][ fieldName ] = { flags: 0, values:null };

		if( fields[i].tagName == 'SELECT' )
		{
			tables[tableName][fieldName].flags |=  parseInt( fields[ i ].value );
		}

		if( fields[i].tagName == 'INPUT' && fields[ i ].checked )
		{
			tables[tableName][fieldName].flags |= flags[ fields[ i ].value];
		}
		if( fields[i].tagName == 'INPUT' && fields[ i ].type=="text" && fields[i].value)
		{
			tables[tableName][fieldName].values = fields[ i ].value.split(',');
		}

		if( sw_id('addComments').checked )
			tables[tableName][fieldName].comment = getFlagsArrayValues( tables[tableName][fieldName].flags );
	}
	return tables;
}

function getFlagsArrayValues(flag )
{
	var fs = [];

	for(var i in flags )
	{
		if( (flag & flags[ i ])== flags[ i ] )
		{
			fs.push( i+' '+flags[ i ] );
		}
	}
	return fs;
}

function toCommonStructure( schema )
{

	var data = {};
	var types	=
	{
		'enum'	:
		{
			regex	: /^enum/
			,type	: 'ENUM_VALUE'
		}
		,'string'	:
		{
			regex	: /^varchar/
			,type	: 'STRING_VALUE'
		}
		,'timestamp':
		{
			regex	: /^timestamp/
			,type	: 'TIMESTAMP_VALUE'
		}
		,'text'		:
		{
			regex	: /^text/
			,type	: 'STRING_VALUE'
		}
		,'float'	:
		{
			regex	: /^float/
			,type	: 'FLOAT_VALUE'
		}
		,'decimal'	:
		{
			regex	: /^decimal/
			,type	: 'FLOAT_VALUE'
		}
		,'int'		:
		{
			regex	: /^int/
			,type	: 'INT_VALUE'
		}
	}


	for( var i in schema)
	{
		data[ i ] = [];

		for( var j=0; j<schema[ i ].length; j++ )
		{
	 		//console.log( schema[ i ][j] );
			var name		= schema[ i ][ j ].Field;
			var values		= '';
			var type		= 'STRING_VALUE';

			console.log( name );
			for( var k in types)
			{
				if( types[ k ].regex.test( schema[ i ][ j ].Type ) )
				{
					type 	= types[ k ].type
					values	= '';
					if( types[ k ].type == 'ENUM_VALUE' )
					{
						console.log( schema[ i ][ j ].Type )
						var matches = /^enum\((.*)\).*/.exec( schema[ i ][ j ].Type );
						var v		= matches.length > 1 ? matches[1] : '';
						values 		= v.replace(/'/g,'');
					}
					break;
				}
			}
			if( values == null )
				values = '';

			data[ i ][ name ]	= { type: type , values: values };
		}
	}
	console.log( data );
	return data;
}

function getTypeSelect(tableName,fieldName,field_type,values)
{
	var dataAttr  ='data-table="'+tableName+'" data-field="'+fieldName+'"';

	//console.log( getFlagsArrayValues( field_type ) );

	var field_types =
	[
		 'INT_VALUE'
		,'STRING_VALUE'
		,'EMAIL_VALUE'
		,'DOMAIN_VALUE'
		,'URL_VALUE'
		,'TIMESTAMP_VALUE'
		,'PHONE_VALUE'
		,'ENUM_VALUE'
		,'FLOAT_VALUE'
		,'CREDIT_CARD_VALUE'
		,'DIGITS_VALUE'
		,'TIME_VALUE'
		,'DISCOUNTINUED'
	];

	var options = '<select '+dataAttr+'" data-type="type">';

	for( var i=0;i<field_types.length;i++ )
	{
		var checked = false;
		if( isNaN( field_type ) )
		{
			checked = field_type == field_types[ i ]
		}
		else
		{
			var index	= field_types[ i ];
			var andOp	= field_type & flags[ index ];
			checked = andOp == flags[ index ];
		}

		options += '<option value="'+flags[field_types[ i ]]+'" '
			+(checked?' selected="selected"':'')+'>'
			+field_types[ i ]
			+'</option>'
	}
	options	+= '</select>'


	var requiredInsert 	= '';
	var requiredUdate	= '';
	var ignoreInsert	= '';
	var ignoreUpdate	= '';
	var timestampCreate	= '';
	var dontExport		= '';
	var trimOnSave		= '';
	var insertEmptyDefault	= '';

	if( !isNaN( field_type ) )
	{
		requiredInsert 	= (field_type & flags['REQUIRED_ON_INSERT']		)== 0 	?'':'checked';
		requiredUdate	= (field_type & flags['REQUIRED_ON_UPDATE']		)== 0 	?'':'checked';
		ignoreInsert	= (field_type & flags['IGNORE_ON_INSERT']		)== 0 	?'':'checked';
		ignoreUpdate	= (field_type & flags['IGNORE_ON_UPDATE']		)== 0 	?'':'checked';
		timestampCreate	= (field_type & flags['TIMESTAMP_ON_CREATE']	)== 0 	?'':'checked';
		dontExport		= (field_type & flags['DONT_EXPORT_EXTERNAL']	)== 0 	?'':'checked';
		trimOnSave		= (field_type & flags['TRIM_ON_SAVE']			)== 0 	?'':'checked';
		insertEmptyDefault = (field_type & flags['INSERT_EMPTY_DEFAULT'] )== 0	?'':'checked';
	}



	return  '<h3>'+(tableName.toUpperCase()) +' '+fieldName+'</h3>'
		+	options
		+	'<label><input '+dataAttr+' type="checkbox" value="REQUIRED_ON_INSERT" '+requiredInsert+'>REQUIRED On Insert</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="REQUIRED_ON_UPDATE" '+requiredUdate+'>REQUIRED On Update</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="IGNORE_ON_INSERT" '+ignoreInsert+'>IGNORE ON INSERT</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="IGNORE_ON_UPDATE" '+ignoreUpdate+'>IGNORE ON UPDATE</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="TIMESTAMP_ON_CREATE" '+timestampCreate+'>TIMESTAMP_ON_CREATE</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="DONT_EXPORT_EXTERNAL" '+dontExport+'>DONT_EXPORT_EXTERNAL</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="TRIM_ON_SAVE" '+trimOnSave+'>TRIM_ON_SAVE</label>'
		+	'<label><input '+dataAttr+' type="checkbox" value="INSERT_EMPTY_DEFAULT" '+insertEmptyDefault+'>INSERT_EMPTY_DEFAULT</label>'
		+	'<label>Enum Values<br><input '+dataAttr+' type="text" value="'+values+'"></label>'
}

