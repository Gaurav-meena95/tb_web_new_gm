<?php
//Detect special conditions devices
$iPod    = stripos($_SERVER['HTTP_USER_AGENT'],"iPod");
$iPhone  = stripos($_SERVER['HTTP_USER_AGENT'],"iPhone");
$iPad    = stripos($_SERVER['HTTP_USER_AGENT'],"iPad");
$Android = stripos($_SERVER['HTTP_USER_AGENT'],"Android");

// Store the source traffic is coming from

$serverName = "travelbuddy-prod.chq8n3uqelay.ap-south-1.rds.amazonaws.com";
$databaseUsername = "admin";
$databasePassword = "RFlNvTQpkdRmQaoIBFbe";
$databaseName = "TRAVELBUDDY";
$connection = new mysqli($serverName, $databaseUsername, $databasePassword, $databaseName);
$connection->set_charset("utf8mb4");

$url = $_SERVER['REQUEST_URI'];
$parts = parse_url($url);
parse_str($parts['query'], $query);
$src =  $query['source'];
$client_ip = get_client_ip();


//do something with this information
if( $iPod || $iPhone ){
    $query = "insert into partner_traffic_source(source,source_platform,source_ip,creation_time) values('$src','ios','$client_ip',now())";
    $redirect_url = "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1336926442&mt=8";
}else if($iPad){
     $query = "insert into partner_traffic_source(source,source_platform,source_ip,creation_time) values('$src','ios','$client_ip',now())";
     $redirect_url = "https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1336926442&mt=8";   
}else if($Android){
    $query = "insert into partner_traffic_source(source,source_platform,source_ip,creation_time) values('$src','android','$client_ip',now())";
    $redirect_url = "market://details?id=com.beatravelbuddy.travelbuddy";
}
else
{
    $query = "insert into partner_traffic_source(source,source_platform,source_ip,creation_time) values('$src','web','$client_ip',now())";
    $redirect_url = "https://www.beatravelbuddy.com";
}

mysqli_query($connection, $query);
mysqli_close($connection);

header("Location: $redirect_url");
exit();


function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}
?> 

