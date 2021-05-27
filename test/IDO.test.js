const { expectRevert, time } = require("@openzeppelin/test-helpers");
const MockORC20 = artifacts.require("MockORC20");
const MockUserProfile = artifacts.require("MockUserProfile");
const IDO = artifacts.require("IDOImpl");

contract("IDO", ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => {
    this.lp = await MockORC20.new("LPToken", "LP1", "1000000", {
      from: minter
    });
    this.idoToken = await MockORC20.new("WOW", "WOW", "1000000", {
      from: minter
    });

    await this.lp.transfer(alice, "10", { from: minter });
    await this.lp.transfer(bob, "10", { from: minter });
    await this.lp.transfer(carol, "10", { from: minter });
  });

  it("raise not enough lp", async () => {
    const userProfile = await MockUserProfile.new({ from: minter });
    // 10 lp raising, 100 ido to offer
    this.ido = await IDO.new({ from: minter });
    await this.ido.initialize(
      this.lp.address,
      this.idoToken.address,
      "20",
      "30",
      "100",
      "10",
      "1",
      userProfile.address,
      dev
    );
    await this.idoToken.transfer(this.ido.address, "100", { from: minter });

    await this.lp.approve(this.ido.address, "1000", { from: alice });
    await this.lp.approve(this.ido.address, "1000", { from: bob });
    await this.lp.approve(this.ido.address, "1000", { from: carol });
    await expectRevert(this.ido.deposit("1", { from: bob }), "not ido time");

    await time.advanceBlockTo("20");

    await this.ido.deposit("1", "", { from: alice });
    await this.ido.deposit("2", "", { from: bob });
    await this.ido.deposit("3", "", { from: carol });
    assert.equal((await this.ido.totalAmount()).toString(), "6");
    assert.equal(
      (await this.ido.getUserAllocation(carol)).toString(),
      "500000"
    );
    assert.equal(
      (await this.ido.getUserAllocation(alice)).toString(),
      "166666"
    );
    assert.equal((await this.ido.getOfferingAmount(carol)).toString(), "30");
    assert.equal((await this.ido.getOfferingAmount(bob)).toString(), "20");
    assert.equal((await this.ido.getRefundingAmount(bob)).toString(), "0");
    await expectRevert(this.ido.harvest({ from: bob }), "not harvest time");

    await time.advanceBlockTo("30");
    assert.equal((await this.lp.balanceOf(carol)).toString(), "7");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "0");
    await this.ido.harvest({ from: carol });
    assert.equal((await this.lp.balanceOf(carol)).toString(), "7");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "30");
    await expectRevert(this.ido.harvest({ from: carol }), "nothing to harvest");
  });

  it("raise enough++ lp", async () => {
    const userProfile = await MockUserProfile.new({ from: minter });
    // 10 lp raising, 100 ido to offer
    this.ido = await IDO.new({ from: minter });
    await this.ido.initialize(
      this.lp.address,
      this.idoToken.address,
      "50",
      "100",
      "100",
      "10",
      "1",
      userProfile.address,
      dev
    );
    await this.idoToken.transfer(this.ido.address, "100", { from: minter });

    await this.lp.approve(this.ido.address, "1000", { from: alice });
    await this.lp.approve(this.ido.address, "1000", { from: bob });
    await this.lp.approve(this.ido.address, "1000", { from: carol });
    await expectRevert(
      this.ido.deposit("1", "", { from: bob }),
      "not ido time"
    );

    await time.advanceBlockTo("50");

    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    assert.equal((await this.ido.totalAmount()).toString(), "18");
    assert.equal(
      (await this.ido.getUserAllocation(carol)).toString(),
      "500000"
    );
    assert.equal(
      (await this.ido.getUserAllocation(alice)).toString(),
      "333333"
    );
    assert.equal((await this.ido.getOfferingAmount(carol)).toString(), "50");
    assert.equal((await this.ido.getOfferingAmount(bob)).toString(), "16");
    assert.equal((await this.ido.getRefundingAmount(carol)).toString(), "4");
    assert.equal((await this.ido.getRefundingAmount(bob)).toString(), "2");
    await expectRevert(this.ido.harvest({ from: bob }), "not harvest time");
    assert.equal((await this.ido.totalAmount()).toString(), "18");

    await time.advanceBlockTo("100");
    assert.equal((await this.lp.balanceOf(carol)).toString(), "1");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "0");
    await this.ido.harvest({ from: carol });
    assert.equal((await this.lp.balanceOf(carol)).toString(), "5");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "50");
    await expectRevert(this.ido.harvest({ from: carol }), "nothing to harvest");
    assert.equal((await this.ido.hasHarvest(carol)).toString(), "true");
    assert.equal((await this.ido.hasHarvest(bob)).toString(), "false");
  });

  it("raise enough lp", async () => {
    const userProfile = await MockUserProfile.new({ from: minter });
    // 10 lp raising, 100 ido to offer
    this.ido = await IDO.new({ from: minter });
    await this.ido.initialize(
      this.lp.address,
      this.idoToken.address,
      "120",
      "170",
      "18",
      "18",
      "1",
      userProfile.address,
      alice
    );
    await this.idoToken.transfer(this.ido.address, "100", { from: minter });

    await this.lp.approve(this.ido.address, "1000", { from: alice });
    await this.lp.approve(this.ido.address, "1000", { from: bob });
    await this.lp.approve(this.ido.address, "1000", { from: carol });
    await expectRevert(this.ido.deposit("1", { from: bob }), "not ido time");

    await time.advanceBlockTo("120");

    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    await this.ido.deposit("1", "", { from: bob });
    await this.ido.deposit("2", "", { from: alice });
    await this.ido.deposit("3", "", { from: carol });
    assert.equal((await this.ido.totalAmount()).toString(), "18");
    assert.equal(
      (await this.ido.getUserAllocation(carol)).toString(),
      "500000"
    );
    assert.equal(
      (await this.ido.getUserAllocation(alice)).toString(),
      "333333"
    );
    assert.equal((await this.ido.getOfferingAmount(carol)).toString(), "9");
    assert.equal((await this.ido.getOfferingAmount(minter)).toString(), "0");
    assert.equal((await this.ido.getOfferingAmount(bob)).toString(), "3");
    assert.equal((await this.ido.getRefundingAmount(carol)).toString(), "0");
    assert.equal((await this.ido.getRefundingAmount(bob)).toString(), "0");
    await expectRevert(this.ido.harvest({ from: bob }), "not harvest time");
    assert.equal((await this.ido.totalAmount()).toString(), "18");

    await time.advanceBlockTo("170");
    assert.equal((await this.lp.balanceOf(carol)).toString(), "1");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "0");
    await this.ido.harvest({ from: carol });
    assert.equal((await this.lp.balanceOf(carol)).toString(), "1");
    assert.equal((await this.idoToken.balanceOf(carol)).toString(), "9");
    await expectRevert(this.ido.harvest({ from: carol }), "nothing to harvest");
    assert.equal((await this.ido.hasHarvest(carol)).toString(), "true");
    assert.equal((await this.ido.hasHarvest(bob)).toString(), "false");
    assert.equal((await this.ido.getAddressListLength()).toString(), "3");
  });

  it("require avatar", async () => {
    const userProfile = await MockUserProfile.new({ from: minter });
    // 10 lp raising, 100 ido to offer
    this.ido = await IDO.new({ from: minter });
    await this.ido.initialize(
      this.lp.address,
      this.idoToken.address,
      "2000",
      "2020",
      "100",
      "10",
      "1",
      userProfile.address,
      dev
    );

    await this.idoToken.transfer(this.ido.address, "100", { from: minter });
    await this.lp.approve(this.ido.address, "1000", { from: alice });

    await time.advanceBlockTo("2000");
    await userProfile.setAvatar(false);
    await expectRevert(this.ido.deposit("1", { from: alice }), "no avatar");

    await userProfile.setAvatar(true);
    await this.ido.deposit("1", { from: alice });
    assert.equal((await this.ido.totalAmount()).toString(), "1");
    assert.equal((await this.lp.balanceOf(alice)).toString(), "9");
    assert.equal((await this.lp.balanceOf(this.ido.address)).toString(), "1");
  });
});
