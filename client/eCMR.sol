//pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

// inspired from https://github.com/DCReum/dcreum.github.io/blob/dev/contracts/workflow.sol

contract ECMR {

  bytes32 transactionID;

  struct eCMRHeaderDetails {
    uint ecmrID;
    uint typeCode;
    uint ecmrIssueDateTime;
    string[] contractualRemarks;
  }


  struct roadConsignment {
      uint grossWeight;
      uint grossVolume;
      uint associatedInvoiceAmount;
      uint CODamount;
      uint consignmentItemQuantity;
      uint cargoInsuranceInstructions;
      uint transshipmentPermittedIndicator;
  }


  struct LVN{
    date LVissuance;
    date StartShipment;
    string deliveryAddress;
    string chargmentAddress;

    struct carrier{
      string name;
      string address;
      string numSIREN;
    }

    struct merchandise{
      string nature;
      uint quantity;
      uint grossWeight;
      uint grossVolume;
    }
    
    struct shipper{
      string name;
      string address;
    }

    struct issuer{
      string name;
      string address;
      string numSIREN;
    }

  }

  ///////////////// Misc ////////////////////////

  function getStatus() public view returns (uint256) {
    return status;
  }
  
  function getWkfLength() public view returns (uint256){
    return includesTo.length;
  }

  function getIncluded() public view returns (uint256[] memory){
    return included;
  }
  function getExecuted() public view returns (uint256[] memory){
    return executed;
  }
  function getPending() public view returns (uint256[] memory){
    return pending;
  }

  function getCanExecuteCheck() public view returns (uint32){
    return canExecuteCheck;
  }

  function getCheCheck() public view returns (uint256){
    return checheck;
  }

  function getConditionsFrom() public view returns (uint256[10][] memory){
    return conditionsFrom;
  }

  function getHashes() public view returns (bytes[10] memory) {
    return ipfsActivityHashes;
  }


  ///////////////// Utils /////////////////////////
  
  function canExecute (uint256 activityId) public returns (bool) {
    
    // activity must be included
    if(included[activityId] == 0){
      canExecuteCheck = 1;
      return false;
    } 

    // all conditions executed
    for(uint id=0; id<conditionsFrom.length;id++){
      uint256[10] memory conditionsRow = conditionsFrom[id]; 
      if(conditionsRow[activityId]==1){
        if((executed[id]==0) && (included[id]==1)){
          canExecuteCheck = 2;
          return false;
        } 
      }
    }

    // no milestones pending
    for(uint id=0; id<milestonesFrom.length;id++){
      uint256[10] memory milestonesRow = milestonesFrom[id]; 
      if(milestonesRow[activityId]==1){
        if((pending[id]==1) && (included[id]==1)){
          canExecuteCheck = 3;
          return false;
        } 
      }
    }

    canExecuteCheck = 0;
    return true;
  }

  ///////////////// Main functions /////////////////////////


  function createWorkflow(
    // packed state variables
    uint256[] memory _includedStates,
    uint256[] memory _executedStates,
    uint256[] memory _pendingStates,
    //bytes[] memory _activityNames,

    // relations
    uint256[10][] memory _includesTo,
    uint256[10][] memory _excludesTo,
    uint256[10][] memory _responsesTo,
    uint256[10][] memory _conditionsFrom,
    uint256[10][] memory _milestonesFrom
  ) public {
    // activity data
    //activityNames = _activityNames;
    included = _includedStates;
    executed = _executedStates;
    pending = _pendingStates;

    // relations
    includesTo = _includesTo;
    excludesTo = _excludesTo;
    responsesTo = _responsesTo;
    conditionsFrom = _conditionsFrom;
    milestonesFrom = _milestonesFrom;
    
    emit LogWorkflowCreation(msg.sender);
  }



function checkCliquedIndex(uint256 activityId, bytes memory ipfsHash) public {
    if (!canExecute(activityId)) {
      status = 0;
      //revert();
    }
    else {
      // executed activity
      executed[activityId] = 1;
      pending[activityId] = 0; 
      ipfsActivityHashes[activityId] = ipfsHash; 

      uint256[10] memory exclude_vect_check =  excludesTo[activityId];
      uint256[10] memory response_vect_check =  responsesTo[activityId];

      // add include relations
      uint256[10] memory include_vect_check =  includesTo[activityId];

      // update with condition relations ok
      uint256[10] memory conditionsTo =  conditionsFrom[activityId]; //extract row condition 
      for (uint id=0; id<conditionsTo.length;id++){
        if(conditionsTo[id]==1){
            include_vect_check[id]=1;
        }
      }

      for(uint id=0; id<excludesTo.length;id++){
        // exclude and include relations pass
        // note includes happens after the exclude pass    
        // included = (included & ~excludesTo[activityId]) | includesTo[activityId];
        if((exclude_vect_check[id]!=1) && (include_vect_check[id]==1)){
          included[id]=1;
        }

        // response relations pass
        // pending = (pending | responsesTo[activityId]);
        if (response_vect_check[id] == 1){
          pending[id]=1;
          included[id]=1;
        }
      }

      emit LogExecution(activityId, msg.sender);

      status = 1;
    }
  }
}
