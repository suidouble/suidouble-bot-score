# suidouble-sample-color

Very simple chat application to demonstrate [suidouble](https://github.com/suidouble/suidouble) library in action, focusing on events (fetch and subscribe)

- [check it out online](https://suidouble-color.herokuapp.com/).

<img src="https://suidouble.github.io/sui_videos/suidouble_color.gif" height="300">

Stack: Sui + suidouble + Vue. Ready to be deployed to Heroku

Code pieces to take a look at:

- smart contract: [suidouble_color.move](move/suidouble_color/sources/suidouble_color.move)
- smart contract integration test: [test_the_move_contract.test.js](test/test_the_move_contract.test.js)
- [connect to Sui component](https://github.com/suidouble/vue-sui) 
- [sui blockchain interaction components](frontend/src/components) 
- deploy smart contract script - [deploy_contract.js](deploy_contract.js)

### running on your local

```bash
npm install
npm run dev
```

### executing integration tests:

```bash
npm run test
```
