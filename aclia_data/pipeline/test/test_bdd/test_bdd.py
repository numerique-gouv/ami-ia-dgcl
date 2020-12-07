import logging
import unittest

import pandas as pd
from pipeline import bdd
from sqlalchemy import MetaData

logging.basicConfig(level=logging.ERROR)


class BddTest(unittest.TestCase):
    def setUp(self):
        self.db = bdd.PostgreSQL_DB()

        d = {"col1": [1, 2], "col2": [3, 4]}
        self.df = pd.DataFrame(data=d)

    def test_save_table(self):
        result_save = self.db.save_table(self.df, "test_bdd")

        metadata = MetaData(self.db.engine, reflect=True)
        metadata_table = metadata.tables.get("test_bdd")

        self.assertTrue(result_save)
        self.assertEqual(len(list(metadata_table.columns)), 2)
        self.assertEqual(metadata_table.name, "test_bdd")

    def test_get_table(self):
        res_df = self.db.get_table("SELECT * FROM test_bdd")

        diff_dataframes = pd.testing.assert_frame_equal(res_df, self.df)

        self.assertTrue(diff_dataframes is None)


if __name__ == "__main__":
    unittest.main()
