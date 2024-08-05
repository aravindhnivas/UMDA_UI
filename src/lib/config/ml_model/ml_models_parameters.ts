import linear_regression from './linear_regression.yml';
import ridge from './ridge.yml';
import svr from './svr.yml';
import knn from './knn.yml';
import rfr from './rfr.yml';
import gbr from './gbr.yml';
import gpr from './gpr.yml';
import xgboost from './xgboost.yml';
import catboost from './catboost.yml';
import lgbm from './lgbm.yml';

export default {
    linear_regression,
    ridge,
    svr,
    knn,
    rfr,
    gbr,
    gpr,
    xgboost,
    catboost,
    lgbm,
} as Record<MLModel, CurrentModel>;
