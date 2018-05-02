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
        html += '<a href="/user/'+data.user._id+'"><img class="rounded-circle" src="http://www.britishcastle.club/wp-content/uploads/2017/06/sample-customer-photo2.jpg" height="75" width="75" alt=""></a>';
        html += '<div class="ml-3">';
        html += '<h5 class="card-title">'+data.user.name+'</h5>';
        html += '<h6 class="card-subtitle mb-2 text-muted">'+moment(data.tweet.created).format('MMM Do YYYY, h:mm a')+'</h6>';
        html += '<p class="card-text">'+data.tweet.content+'</p>';
        html += '</div></div></div>';

        $('#tweets').prepend(html);
    });


    $('#follow').click(function(){
        var id = $('#user_id').val();
        $.ajax({
            url: '/user/follow/'+id,
            type: 'POST',
            success: function(data) {
                $('#follow').text('Following').removeClass('btn-primary').addClass('btn-success').attr('id','unfollow')
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $('#unfollow').click(function(){
        var id = $('#user_id').val();
        $.ajax({
            url: '/user/unfollow/'+id,
            type: 'POST',
            success: function(data) {
                $('#unfollow').text('Follow').removeClass('btn-success btn-danger').addClass('btn-primary').attr('id','follow')
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    $('#unfollow').on('mouseover', function(){
        $('#unfollow').removeClass('btn-success').addClass('btn-danger').text('Unfollow');
    });
    $('#unfollow').on('mouseleave', function(){
        $('#unfollow').removeClass('btn-danger').addClass('btn-success').text('Following');
    });
});