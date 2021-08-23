import { task } from 'hardhat/config';
import { utils } from 'ethers';
import { checkVerification } from '../../helpers/etherscan-verification';
import { ConfigNames } from '../../helpers/configuration';
import { printContracts } from '../../helpers/misc-utils';
import { getFirstSigner } from '../../helpers/wallet-helpers';

task('aave:dev', 'Deploy development environment')
  .addFlag('verify', 'Verify contracts at Etherscan')
  .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = ConfigNames.Aave;

    await localBRE.run('set-DRE');


    const signer = await getFirstSigner();
    console.log('Signer', await signer.getAddress());
    console.log('Balance', utils.formatEther(await signer.getBalance()));

    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    console.log('Migration started\n');

    console.log('1. Deploy mock tokens');
    await localBRE.run('dev:deploy-mock-tokens', { verify });

    console.log('2. Deploy address provider');
    await localBRE.run('dev:deploy-address-provider', { verify });

    console.log('3. Deploy pool');
    await localBRE.run('dev:deploy-pool', { verify });

    console.log('4. Deploy oracles');
    await localBRE.run('dev:deploy-oracles', { verify, pool: POOL_NAME });

    console.log('5. Deploy WETH Gateway');
    await localBRE.run('full-deploy-weth-gateway', { verify, pool: POOL_NAME });

    console.log('6. Initialize pool');
    await localBRE.run('dev:initialize-pool', { verify, pool: POOL_NAME });

    console.log('\nFinished migration');
    printContracts();
  });
