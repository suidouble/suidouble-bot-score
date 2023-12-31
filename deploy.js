const { SuiMaster } = require('suidouble');
const path = require('path');


const run = async ()=>{
    // const provider = 'local';
    const provider = 'dev';
    // const provider = 'main';

    const suiMaster = new SuiMaster({ debug: true, as: 'admin', provider: provider, });
    // const suiMaster = new SuiMaster({ debug: true, phrase: 'secret phrase', provider: provider, });

    await suiMaster.requestSuiFromFaucet();
    await suiMaster.getBalance();

    const package = suiMaster.addPackage({
        path: path.join(__dirname, 'move/suidouble_score'),
    });

    await package.publish();

    console.log('deployed as', package.id);
};

run()
    .then(()=>{
        console.log('done');
    });
