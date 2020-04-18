'use strict';

const {
  app,
  assert,
} = require('egg-mock/bootstrap');
const uuid = require('uuid');
const createForm = require('./mock/create.json');
const editForm = require('./mock/edit.json');
const applyForm = require('./mock/apply.json');
 
describe('test/app/service/m_event/index.js', () => {

  it('should create an event', async () => {
    const ctx = app.mockContext({});
    const res = await ctx.service.mEvent.index.create({
      Id: uuid.v4(),
      ...createForm
    });

    assert(res.success);
  });

  it('should create an event: 应该失败 ', async () => {
    const ctx = app.mockContext({});
    const res = await ctx.service.mEvent.index.create({
      Id: null,
      ...createForm
    });

    assert(!res.success);
  });

  it('should get an event', async () => {
    const ctx = app.mockContext({});
    const res = await ctx.service.mEvent.index.getById('6ca4fe64-afa7-462d-89af-9ea9186fd222');
    console.log(JSON.stringify(res, null, 2));
    assert(res.success);
  });


  it('should edit an event', async () => {
    const ctx = app.mockContext({});

    const res = await ctx.service.mEvent.index.edit({
      ...editForm
    });
    assert(res.success);
  });

  it.only('should apply a user to an event', async () => {
    const ctx = app.mockContext({});

    const res = await ctx.service.mEvent.index.apply({
      ...applyForm
    });
    assert(res.success);
  });

});
