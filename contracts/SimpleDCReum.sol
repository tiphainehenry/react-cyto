pragma solidity 0.5.16;

// inspired from https://github.com/DCReum/dcreum.github.io/blob/dev/contracts/workflow.sol

contract SimpleDCReum {

  // event declaration
  event LogWorkflowCreation (address indexed creator);
  event LogExecution (uint256 indexed activityId, address indexed executor);

  // variable declarations. 0=no, 1=yes
  uint256 status; 

  //activity data:
  uint256 included;
  uint256 executed;
  uint256 pending;

  //relations
  uint256[] includesTo;
  uint256[] excludesTo;
  uint256[] responsesTo;
  uint256[] conditionsFrom;
  uint256[] milestonesFrom;

  ///////////////// Misc ////////////////////////

  function checkCliquedIndex(uint256 activityId) public {
    //if (!canExecute(activityId)) {
    //  status = 0;
    //  revert();
    //}

    //else {
    //  // executed activity
    //  executed = executed | (1<<activityId);
    //  pending = pending & ~(1<<activityId);

    //  // exclude and include relations pass
    //  // note includes happens after the exclude pass    
    //  included = (included & ~excludesTo[activityId]) | includesTo[activityId];

    //  // response relations pass
    //  pending = (pending | responsesTo[activityId]);

    //  emit LogExecution(activityId, msg.sender);

    //  status = 1;
    //}
    
    
    status = 1;

  }

  function getStatus() public view returns (uint256) {
    return status;
  }
  
  function getWkfLength() public view returns (uint256){
    return includesTo.length;
  }
  ///////////////// Utils /////////////////////////
  
  function canExecute (uint256 activityId) public view returns (bool) {
    
    // activity must be included
    if ((included & (1<<activityId)) == 0) return false;

    // all conditions executed
    if(conditionsFrom[activityId] & (~executed & included) != 0) return false;

    // no milestones pending
    if(milestonesFrom[activityId] & (pending & included) != 0) return false;

    return true;
  }

  ///////////////// Main functions /////////////////////////


  function createWorkflow(
    // packed state variables
    uint256 _includedStates,
    uint256 _executedStates,
    uint256 _pendingStates,

    // relations
    uint256[] memory _includesTo,
    uint256[] memory _excludesTo,
    uint256[] memory _responsesTo,
    uint256[] memory _conditionsFrom,
    uint256[] memory _milestonesFrom

  ) public {
    // activity data
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
}
