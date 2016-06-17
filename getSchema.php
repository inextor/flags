<?php

//	echo print_r( $_POST,true );

    $mysqli = new mysqli( $_POST['host'], $_POST['user'], $_POST['password'], $_POST['database']);
	if( !$mysqli )
		echo 'Fails mysqli';

	$res	= $mysqli->query( 'SHOW TABLES' );
	$tables	= array();

	while( $row = $res->fetch_row()  )
	{
		$table_name	= $row[ 0 ];
		$fields_res = $mysqli->query( 'describe `'.$mysqli->real_escape_string( $table_name ).'`');
		$fields		= array();

		while( $fields_rows = $fields_res->fetch_object() )
		{
			$fields[] = $fields_rows;
		}
		$tables[ $table_name ] = $fields;
	}

	echo json_encode( $tables );

function getSchema($field)
{
	$name 	= $field['Field'];
	$type 	=  getType( $field['Type'] );
	$min  	= getMin( $field['Type'] );
	$max 	= getMax( $field['Type'] );
	$values	= getValues( $field['Type'] );
}
