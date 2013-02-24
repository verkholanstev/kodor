<?php
include "connect.php";
	if (get_magic_quotes_gpc()) {
  		$json = stripslashes($_POST["request"]);
	}
	else {
  		$json = $_POST["request"];
	}
	$req = json_decode($json, true);

	$res = array(
		"timestamp" => round(microtime(true) * 1000)
	);
	
header('Content-type: application/json');

include "auth.php";
include "checksession.php";

	switch ($req["Command"]) {
		case "Hello":
		 	$res["status"] = "OK";
			break;

		case "GetPages":
			include "getpages.php";
			break;

		case "GetPage":
			include "getpage.php";
			break;

		case "GetBlock":
			include 'getblock.php';
			break;

		case "GetBlockRights":
			include "getblockrights.php";
			break;

		case "UpdateBlock":
			include 'updateblock.php';
			break;

		default:
			$res["status"] = "ERROR";
			break;
	}

	echo json_encode($res);

	if(isset($_POST["debug"])) {
		var_dump($json);
		var_dump($req);
		var_dump($_POST["request"]);
	}

include "disconnect.php";
?>