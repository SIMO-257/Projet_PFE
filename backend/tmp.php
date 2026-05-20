<?php echo \App\Models\Client::where('email','LIKE','test+%')->orderBy('id','desc')->value('email').PHP_EOL; 
