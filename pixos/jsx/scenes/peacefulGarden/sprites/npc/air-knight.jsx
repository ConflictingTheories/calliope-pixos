/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { ActionLoader } from "@Engine/utils/loaders.jsx";
import AirKnight from "@Engine/sprites/npc/air-knight.jsx";

export default class MyAirKnight extends AirKnight {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
  }
  // Interaction
  interact(sprite, finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case "intro":
        this.state = "loop";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Buying eh?!", false, { autoclose: true, onClose: () => finish(true) }],
          this,
          async () => {
            // Eth Account
            const account = (await window.ethereum.request({ method: "eth_requestAccounts" }))[0];
            // Params
            const msgParams = JSON.stringify({
              domain: {
                // Defining the chain aka Rinkeby testnet or Ethereum Main Net
                chainId: 1,
                // Give a user friendly name to the specific contract you are signing for.
                name: "Pixos",
                // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
                verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
                // Just let's you know the latest version. Definitely make sure the field name is correct.
                version: "1",
              },
              // Defining the message signing data content.
              message: {
                game: "Example",
                contents: "Quest Item",
                from: {
                  sprite: "air-knight",
                  wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                },
                to: {
                  sprite: "avatar",
                  wallet: account,
                },
              },
              // Refers to the keys of the *types* object below.
              primaryType: "Item",
              types: {
                EIP712Domain: [
                  { name: "name", type: "string" },
                  { name: "version", type: "string" },
                  { name: "chainId", type: "uint256" },
                  { name: "verifyingContract", type: "address" },
                ],
                // Refer to PrimaryType
                Item: [
                  { name: "game", type: "string" },
                  { name: "contents", type: "string" },
                  { name: "from", type: "Person" },
                  { name: "to", type: "Person" },
                ],
                Person: [
                  { name: "sprite", type: "string" },
                  { name: "wallet", type: "address" },
                ],
              },
            });
            // Setup
            var from = account;
            var params = [from, msgParams];
            var method = "eth_signTypedData_v4";
            // Sign
            window.web3.currentProvider.sendAsync(
              {
                method,
                params,
                from,
              },
              function (err, result) {
                if (err) return console.dir(err);
                if (result.error) {
                  alert(result.error.message);
                }
                if (result.error) return console.error("ERROR", result);
                const recovered = window.sigUtil.recoverTypedSignature_v4({
                  data: JSON.parse(msgParams),
                  sig: result.result,
                });

                if (window.ethUtil.toChecksumAddress(recovered) === window.ethUtil.toChecksumAddress(from)) {
                  alert("Successfully recovered signer as " + from);
                } else {
                  alert("Failed to verify signer when comparing " + result + " to " + from);
                }
              }
            );
          }
        );

        break;
      case "loop":
        this.state = "loop2";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["I heard about a strange legend once.", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      case "loop2":
        this.state = "loop";
        ret = new ActionLoader(
          this.engine,
          "dialogue",
          ["Sorry, I don't remember the story at the moment", false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      default:
        break;
    }
    if (ret) this.addAction(ret);
    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }
}
