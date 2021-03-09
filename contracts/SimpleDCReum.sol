//pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

contract SimpleDCReum {

  // event declaration
  event LogWorkflowCreation (address indexed creator);
  event LogExecution (uint256 indexed activityId, address indexed executor);

  // variable declarations. 0=no, 1=yes
  uint256 status; 

  //activity data:
  //string[] activityNames;
  bytes[] ipfsActivityHashes;
  uint numActivities;

  uint256[] included;
  uint256[] executed;
  uint256[] pending;

  uint32 canExecuteCheck;
  uint256 checheck;
  //relations
  uint256[][] includesTo;
  uint256[][] excludesTo;
  uint256[][] responsesTo;
  uint256[][] conditionsFrom;
  uint256[][] milestonesFrom;


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

  function getConditionsFrom() public view returns (uint256[][] memory){
    return conditionsFrom;
  }

  function getHashes() public view returns (bytes[] memory) {
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
      uint256[] memory conditionsRow = conditionsFrom[id]; 
      if(conditionsRow[activityId]==1){
        if((executed[id]==0) && (included[id]==1)){
          canExecuteCheck = 2;
          return false;
        } 
      }
    }

    // no milestones pending
    for(uint id=0; id<milestonesFrom.length;id++){
      uint256[] memory milestonesRow = milestonesFrom[id]; 
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
    uint256[][] memory _includesTo,
    uint256[][] memory _excludesTo,
    uint256[][] memory _responsesTo,
    uint256[][] memory _conditionsFrom,
    uint256[][] memory _milestonesFrom
  ) public {
    // activity data
    //activityNames = _activityNames;
    numActivities = _includedStates.length;
    ipfsActivityHashes = new bytes[](numActivities);

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

      uint256[] memory exclude_vect_check =  excludesTo[activityId];
      uint256[] memory response_vect_check =  responsesTo[activityId];

      // add include relations
      uint256[] memory include_vect_check =  includesTo[activityId];

      // update with condition relations ok
      uint256[] memory conditionsTo =  conditionsFrom[activityId]; //extract row condition 
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

