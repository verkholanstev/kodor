<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

$sql_server = "localhost";
$sql_username = "root";
$sql_password = "12345";
$sql_db = "kodor";

$connection = mysql_connect($sql_server, $sql_username, $sql_password);
if (!$connection) {
	die("Ошибка соединения: " . mysql_error());
}

$db_connection = mysql_select_db($sql_db);
	if (!$db_connection) {
		die("Database connection error: " . mysql_error());
	}

mysql_query('SET NAMES utf8');
?>