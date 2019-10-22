App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
	//metamask가 있는지 확인
    if (window.ethereum) {
		//metamask로 설정
		App.web3Provider = window.ethereum;
	/*metamask와 연결*/
		try {
			//계쩡연결 승인창
			await window.ethereum.enable();
			/*metamask의 계정 접근 허용*/
		} catch (error) {
			console.error("User denied account access");
		}
	} else if (window.web3) {
		/*metamask가 없고 다른 provider를 사용하는 경우 거기에 연결*/
		App.web3Provider = window.web3.currentProvider;
	} else {
		App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
	}
	/*현재 연결한 provider로 사용*/
	web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
	/*Adoption contract의 artifact를 불러와서*/
	var AdoptionArtifact = data;
	/*Adoption contract가 deploy 되어 있는지 확인할 객체를 생성하고*/
	App.contracts.Adoption = TruffleContract(AdoptionArtifact);
	/*해당 객체와 현재 사용하는 provider를 연결*/
	App.contracts.Adoption.setProvider(App.web3Provider);
	return App.markAdopted();
	});


    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

	App.contracts.Adoption.deployed().then(function(instance) {
		/*Adoption contract가 deploy 되어있다면*/
		adoptionInstance = instance;
		/*연동할 객체를 저장한뒤*/
		return adoptionInstance.getAdopters.call();
		/*Adoption contract의 애완동물들의 주인들 주소들이 저장된 배열을 호출*/
	}).then(function(adopters) {
		/*해당 호출이 끝나면*/
		for (i = 0; i < adopters.length; i++) {
			if(adopters[i] !=='0x0000000000000000000000000000000000000000') {
			/*만약 i 번째 애완동물의 주인이 있을 때*/
				$('.panel-pet').eq(i).find('button').text('Success').attr('disabled',true);
				/*해당 버튼을 찾아서 Success로 글씨를 바꾼 뒤 클릭이 안되도록 속성을 변경*/
			}
		}
	}).catch(function(err) {
		console.log(err.message);
	});

  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

	web3.eth.getAccounts(function(error, accounts) {
		/*현재 사용하고 있는 provider(해당 tutorial의 경우 metamask)의
		지갑주소 목록들을 불러와서*/
		if (error) {
			console.log(error);
		}
		var account = accounts[0];
		/*상호작용하면서 사용할 계정을 첫번째 계정으로 설정함
		해당 tutorial의 경우 metamask의 첫번째 계정*/
		App.contracts.Adoption.deployed().then(function(instance) {
			adoptionInstance = instance;
			return adoptionInstance.adopt(petId, {from: account, value:10000000000000000});
			/*Adoption contrac의 petId번째 애완동물을 account가 분양하는 함수 호출*/
		}).then(function(result) {
			/*분양 작업이 완료되면*/
			return App.markAdopted();
			/*해당 애완동물의 버튼을 바꾸어 다른사람이 분양하지 못하도록 수정*/
		}).catch(function(err) {
			console.log(err.message);
		});
	});

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
