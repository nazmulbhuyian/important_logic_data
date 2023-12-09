app.get("/getForm", (req, res) => {
    // res.send("Trade Venture App is working! YaY!");
    res.sendFile(__dirname + '/public/form.html');
  });
  
  app.post('/postForm', function (request, response, next) {
    const data = request.body;
    console.log(data);
  
    // response.send(request.body);
    response.redirect('http://127.0.0.1:5173/user');
  
  });