app.post("/signup",(req,res)=>{
    //get data from html form through req.body
    //check if email provided is in the database(registered users)
    //hash password
    //insert into database
   
    dbconn.query(`SELECT patients FROM PatientID WHERE patients="${req.body.patients}"` , (err,result)=>{
        if(err){
            res.status(500).send('Server Error')}
            else{
                if (result.length>0){
                    //email found
                    res.render('signup.ejs',{errorMessage:"Email already in use. SignUp"})
                }else{
                    //email not found
                    const hashedPassword = bcrypt.hashSync(req.body.password,5);
                    //now store the data
                    dbconn.query(`INSERT INTO members(FullName,Address,Phone,Email,Password,club)VALUES("${req.body.FullName}","${req.body.address}","${req.body.phone}","${req.body.email}","${hashedPassword}",99)`,(error)=>{
                        if (error){
                            res.status(500).send('server error')
                        } else{
                            res.redirect('/signin')
                        }
                   })
                 }
                }
            })
        })        


        
app.post("/signup",(req,res)=>{
    //get data from html form through req.body
    //check if email provided is in the database(registered users)
    //hash password
    //insert into database
   
    dbconn.query(`SELECT patients FROM PatientID WHERE patients="${req.body.email}"` , (err,result)=>{
        if(err){
            res.status(500).send('Server Error')}
            else{
                if (result.length>0){
                    //email found
                    res.render('signup.ejs',{errorMessage:"Email already in use. SignUp"})
                }else{
                    //email not found
                    const hashedPassword = bcrypt.hashSync(req.body.password,5);
                    //now store the data
                    dbconn.query(`INSERT INTO members(FullName,Address,Phone,Email,Password,club)VALUES("${req.body.FullName}","${req.body.address}","${req.body.phone}","${req.body.email}","${hashedPassword}",99)`,(error)=>{
                        if (error){
                            res.status(500).send('server error')
                        } else{
                            res.redirect('/signin')
                        }
                   })
                 }
                }
            })
        })        
app.post('/signin',(req,res)=>{
    //get data from html form through req.body
    //check if email provided is in the database(registered users)
    //check if password matches the one in the database bcrypt.comparesync
    //if all is good, redirect to home page/create a session.......what are sessions and why is http stateless ,what are cookies,in web ofc
    console.log(req.body);
    dbconn.query(`SELECT * FROM members WHERE Email ="${req.body.email}"`, (error,member)=>{
        if(error){
            console.log(error);
            res.status(500).send('Server Error')
        }else{
            console.log(member);
            if (member.length==0){
                res.render('signin.ejs',{errorMessage:"Email not registered. Sign Up"})
            }else{
                let passwordMatch=bcrypt.compareSync(req.body.password,member[0].password)
                console.log(passwordMatch);
                if(passwordMatch){
                    //initiate a session\
                    req.session.user=member[0];
                    res.redirect('/')
                }else{
                    res.render('signin.ejs',{errorMessage:"Password incorrect."})
                } }

        }
    })


})