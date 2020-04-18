'use strict';

const {
    app,
    assert,
  } = require('egg-mock/bootstrap');
  
const uuid = require('uuid');
const Id = uuid.v4();

// before(() => {

// });

  describe('test/app/service/__tablename__.js', () => {
  
    it('should create a __tablename__', async () => {
      const ctx = app.mockContext({});

      //__references_//

      const entity = await ctx.service.__servicename__.create({
        Id: Id,
 __Entity__ : null
      });
      assert(entity.Id);
    });
  
    it('should get a __tablename__', async () => {
      const ctx = app.mockContext({});
      const entiy = await ctx.service.__servicename__.getById(Id);
      assert(entiy.Id ===  Id);
    });
  
    it('should update a __tablename__', async () => {
      const ctx = app.mockContext({});
      const entity = await ctx.service.__servicename__.getById(Id);
      entity.__updateField__ = "update Value";
      const updateCount = await ctx.service.__servicename__.edit(entity);
      assert(updateCount[0] === 1);
  
      const updatedEntity = await ctx.service.__servicename__.getById(Id);
      assert(updatedEntity.__updateField__ ===  entity.__updateField__);
    });

    it('should get latest  __tablename__', async () => {
      const ctx = app.mockContext({});
      const entiy = await ctx.service.__servicename__.getLatest(Id);
      assert(entiy.Id ===  Id);
    });

    it('should get a List of  __tablename__', async () => {
      const ctx = app.mockContext({});
      const pagination = {
        current: 1,
        pageSize: 3
      };
      const query = null;
      const sort = null;
      const entityList = await ctx.service.__servicename__.search(pagination, query, sort);
      assert(entityList.rows.length > 0);
    });

    it('[joinSearch]should get a List of  __tablename__ ', async () => {
      const ctx = app.mockContext({});
      const pagination = {
        current: 1,
        pageSize: 3
      };
      const query = null;
      const sort = null;
      const entityList = await ctx.service.__servicename__.joinSearch(pagination, query, sort);
      assert(entityList.rows.length > 0);
    });

    it('should remove a __tablename__', async () => {
      const ctx = app.mockContext({});
      const entity = await ctx.service.__servicename__.getById(Id);
      const updateCount = await ctx.service.__servicename__.remove(entity);
      assert(updateCount[0] === 1);
  
      const updatedEntity = await ctx.service.__servicename__.getById(Id);
      assert(updatedEntity.Valid ===  0);
    });
  
    it('should delete a __tablename__', async () => {
        const ctx = app.mockContext({});
        const entity =  {
          Id: Id
        }
        const result = await ctx.service.__servicename__.delete(entity);
        assert(result === 1);
    });
  
  });
  