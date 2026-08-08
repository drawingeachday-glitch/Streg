(function(){
  'use strict';

  /* Kept as a tiny compatibility bridge for older cached app shells.
     The inventory now owns its full visual system inside inventory.js. */
  var old = document.getElementById('inventoryCleanStyles');
  if(old) old.remove();

  window.StregInventoryClean = {
    refresh:function(){
      if(typeof window.renderInventory === 'function') window.renderInventory();
    }
  };
})();
