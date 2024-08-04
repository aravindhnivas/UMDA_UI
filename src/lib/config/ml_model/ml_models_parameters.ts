import linear_regression from './linear_regression.yml';
import ridge from './ridge.yml';
import svr from './svr.yml';
import knn from './knn.yml';
import rfr from './rfr.yml';
import gbr from './gbr.yml';
import gpr from './gpr.yml';
import xgboost from './xgboost.yml';

export default {
    linear_regression,
    ridge,
    svr,
    knn,
    rfr,
    gbr,
    gpr,
    xgboost,
} as Record<MLModel, CurrentModel>;
