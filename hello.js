var dev_mode = 0;

function dev( )
{
	googletag.openConsole();
	document.getElementById('developer_nav').style.display = 'inline';
	dev_mode = 1;
}
function hello( )
{
	console.log( "hello.js - v0.2" );
	document.getElementById('developer_nav').style.display = 'inline';
}
window.onload = hello;
