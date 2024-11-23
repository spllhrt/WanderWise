class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
            ? {
                  name: {
                      $regex: this.queryStr.keyword,
                      $options: 'i',
                  },
              }
            : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
    
        // Removing unnecessary fields
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach((el) => delete queryCopy[el]);
    
        // Only include price filtering if it's relevant for the model (e.g., Package model, not Review)
        if (queryCopy.price) {
            delete queryCopy.price;  // Remove price filtering for reviews
        }
    
        this.query = this.query.find(queryCopy);
        return this;
    }
    
    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;
