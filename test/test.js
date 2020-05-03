const Hydrawise = require('../dist/Hydrawise').Hydrawise;

//let hydrawise;
if(process.argv.length <= 3) {
  hydrawise = new Hydrawise({ type: 'CLOUD', key: process.argv[2] });
}
else {
  hydrawise = new Hydrawise({ type: 'LOCAL', host: process.argv[2], password: process.argv[3] });
}

/* Get all zones -> run first zone -> get all zones -> stop first zone -> get all zones */
hydrawise.getZones().then(function(data) {
  console.log(data);
  setTimeout(() => {

    data[0].run().then(function(data) {
      console.log(data);
      setTimeout(() => {
        
        hydrawise.getZones().then(function(data) {
          console.log(data);
          setTimeout(() => {
        
            data[0].stop().then(function(data) {
              console.log(data);
              setTimeout(() => {
        
                hydrawise.getZones().then(function(data) {
                  console.log(data);
        
                  
                }).catch((err) => {
                  console.log(err);
                });
        
              }, 2000);
            }).catch((err) => {
              console.log(err);
            });
    
          }, 2000);
        }).catch((err) => {
          console.log(err);
        });

      }, 2000);
    }).catch((err) => {
      console.log(err);
    });

  }, 2000);
}).catch((err) => {
	console.log(err);
});