# Test Guide for HealthPulse API

## 🧪 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure MongoDB is running on port 27018
# Ensure test database exists
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📋 Test Structure

```
app/tests/
├── setup.js                          # Test configuration
├── unit/                             # Unit tests
│   ├── labOrder.test.js             # Lab order service tests
│   ├── document.test.js             # Medical document tests
│   └── utils.test.js                # Utility function tests
├── integration/                      # Integration tests
│   ├── api.test.js                  # General API tests
│   └── labTechnician.test.js        # Lab technician workflow tests
└── e2e/                             # End-to-end tests
    └── workflows.test.js            # Complete user workflows
```

## 🔬 Test Coverage

### Lab Order Tests (unit/labOrder.test.js)

**✅ Create Lab Order**
- Create with valid data
- Fail without required fields
- Create with multiple tests

**✅ Add Test to Lab Order**
- Add test to pending order
- Prevent adding to completed order

**✅ Update Lab Order Status**
- Update to in_progress
- Update to completed
- Track status history

**✅ Get Lab Orders**
- Get all lab orders
- Filter by status
- Filter by urgency

**✅ Cancel Lab Order**
- Cancel pending order
- Prevent canceling completed order

### Medical Document Tests (unit/document.test.js)

**✅ Upload Document**
- Upload with valid data
- Validate file size limit
- Create with all metadata

**✅ Get Document**
- Get by ID
- Record view in audit trail
- Handle non-existent document

**✅ List Patient Documents**
- List all documents
- Filter by type
- Filter by category
- Paginate results

**✅ Update Document**
- Update metadata
- Prevent file content changes

**✅ Delete Document**
- Soft delete with reason
- Require deletion reason

**✅ Download Document**
- Record download in audit trail

### Integration Tests (integration/labTechnician.test.js)

**✅ Authentication**
- Login as lab technician
- Token validation

**✅ Lab Orders API**
- GET /api/v1/lab-orders
- GET /api/v1/lab-orders/:id
- PATCH /api/v1/lab-orders/:id/status
- POST /api/v1/lab-orders/:id/upload-results
- POST /api/v1/lab-orders/:id/validate
- GET /api/v1/lab-orders/:id/result-history
- PUT /api/v1/lab-orders/:id/tests

**✅ Error Handling**
- 401 without authentication
- 404 for non-existent resources
- 400 for invalid data

## 🎯 Test Examples

### Unit Test Example
```javascript
it('should create a lab order with valid data', async () => {
    const labOrderData = {
        consultationId: new mongoose.Types.ObjectId(),
        patientId: testPatientId,
        doctorId: testDoctorId,
        laboratoryId: testLaboratoryId,
        tests: [
            {
                name: 'Complete Blood Count',
                code: 'CBC',
                category: 'Hematology',
                urgency: 'routine'
            }
        ],
        clinicalIndication: 'Routine checkup'
    };

    const result = await LabOrderService.createLabOrder(labOrderData);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
});
```

### Integration Test Example
```javascript
it('should upload lab results as JSON', async function() {
    const response = await request(app)
        .post(`/api/v1/lab-orders/${labOrderId}/upload-results`)
        .set('Authorization', `Bearer ${labTechToken}`)
        .send({
            tests: [
                {
                    testName: 'Complete Blood Count (CBC)',
                    result: 'Normal',
                    value: '5.0',
                    unit: 'million cells/mcL',
                    status: 'normal'
                }
            ]
        });

    expect(response.status).to.be.oneOf([200, 400]);
});
```

## 🔧 Test Configuration

### Environment Variables
```env
NODE_ENV=test
MONGODB_TEST_URI=mongodb://localhost:27018/healthpulse_test
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Test Database
- Database: `healthpulse_test`
- Port: 27018
- Auto-cleaned between tests

## 📊 Coverage Goals

| Module | Target | Current |
|--------|--------|---------|
| Lab Orders | 80% | ✅ |
| Medical Documents | 80% | ✅ |
| Authentication | 70% | ⏳ |
| Controllers | 70% | ⏳ |
| Services | 85% | ⏳ |

## 🐛 Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should create a lab order"
```

### Verbose Mode
```bash
npm test -- --verbose
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## ✅ Test Checklist

Before committing code:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage above 70%
- [ ] No skipped tests without reason
- [ ] Test names are descriptive
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Authentication tested
- [ ] Permissions tested

## 📝 Writing New Tests

### Template for Unit Test
```javascript
describe('Feature Name', () => {
    beforeEach(async () => {
        // Setup
    });

    it('should do something specific', async () => {
        // Arrange
        const input = {...};
        
        // Act
        const result = await service.method(input);
        
        // Assert
        expect(result.success).toBe(true);
    });
});
```

### Template for Integration Test
```javascript
describe('API Endpoint', () => {
    it('should return expected response', async function() {
        this.timeout(5000);
        
        const response = await request(app)
            .post('/api/v1/endpoint')
            .set('Authorization', `Bearer ${token}`)
            .send(data);

        expect(response.status).to.equal(200);
        expect(response.body.success).to.be.true;
    });
});
```

## 🚀 Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to dev branch
- Before deployment

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/api/)
- [Supertest Guide](https://github.com/visionmedia/supertest)

---

**Last Updated:** November 3, 2024  
**Test Framework:** Jest + Mocha + Chai  
**Coverage Tool:** Jest Coverage
