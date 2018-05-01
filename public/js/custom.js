$(document).ready(function(){
    var socket = io();
    $('#sendTweet').on('click', function(event){
        event.preventDefault();
        var content = $('#tweet').val();
        socket.emit('tweet', {content: content});
        $('#tweet').val('');
        return false;
    });

    socket.on('message', function(data){
        var html = '';
        html += '<div class="card mb-3">';
        html += '<div class="card-body d-flex align-items-center">';
        html += '<img class="rounded-circle" src="http://www.britishcastle.club/wp-content/uploads/2017/06/sample-customer-photo2.jpg" height="75" width="75" alt="">';
        html += '<div class="ml-3">';
        html += '<h5 class="card-title">'+data.user.name+'</h5>';
        html += '<h6 class="card-subtitle mb-2 text-muted">'+moment().format('MMM Do YYYY')+'</h6>';
        html += '<p class="card-text">'+data.tweet.content+'</p>';
        html += '</div></div></div>';

        $('#tweets').prepend(html);
    });
});